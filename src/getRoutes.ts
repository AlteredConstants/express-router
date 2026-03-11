import { routerMetadata } from "./routerMetadata.js";
import type { RequestHandler, Router } from "./types.js";

/**
 * Gets information about each route within the router, including nested routes.
 */
export function getRoutes(router: Router) {
	return Array.from(getRoutesGeneratorWithContext(router));
}

export function getRoutesGenerator(router: Router) {
	return getRoutesGeneratorWithContext(router);
}

function* getRoutesGeneratorWithContext(
	router: Router,
	parent: ParentContext = { path: "", middleware: [] },
): Generator<Route, void> {
	if (!router[routerMetadata]) {
		return;
	}
	const { middleware = [], routes } = router[routerMetadata].config;

	for (const [method, path, routerOrHandler, ...remainingHandlers] of routes) {
		const allMiddleware = [...parent.middleware, ...middleware];
		const fullPath = `${parent.path}/${path}`.replaceAll(/\/+/g, "/");
		if (method === "use") {
			const context = { middleware: allMiddleware, path: fullPath };
			yield* getRoutesGeneratorWithContext(routerOrHandler, context);
		} else {
			const handlerNames = [
				...allMiddleware,
				routerOrHandler,
				...remainingHandlers,
			].map((handler) => {
				return handler[routerMetadata]?.name || handler.name || undefined;
			});

			yield {
				method: method.toUpperCase(),
				path: `/${fullPath.replaceAll(/^\/|\/$/g, "")}`,
				handlerNames,
			};
		}
	}
}

type Route = {
	readonly method: string;
	readonly path: string;
	readonly handlerNames: ReadonlyArray<string | undefined>;
};

type ParentContext = {
	readonly path: string;
	readonly middleware: readonly RequestHandler[];
};

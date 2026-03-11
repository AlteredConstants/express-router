import { routerMetadata } from "./routerMetadata.js";
import type { RequestHandler, Router } from "./types.js";

/**
 * Gets information about each route within the router, including nested routes.
 *
 * @param router - The router to inspect.
 * @returns An array of routes.
 */
export function getRoutes(router: Router) {
	return Array.from(getRoutesGeneratorWithContext(router));
}

/**
 * Gets information about each route within the router, including nested routes.
 *
 * @param router - The router to inspect.
 * @returns An interable/iterator for generating each route.
 */
export function getRoutesGenerator(router: Router) {
	return getRoutesGeneratorWithContext(router);
}

function* getRoutesGeneratorWithContext(
	router: Router,
	parent: ParentContext = { path: "", middleware: [] },
): Generator<Route, void, void> {
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

/** Information about the route. */
type Route = {
	/** The HTTP request method. */
	readonly method: string;
	/** The full route path. */
	readonly path: string;
	/**
	 * The names of every middleware and handler applied to the route. If a name
	 * is not available for the handler, the item in the array will be
	 * `undefined`.
	 */
	readonly handlerNames: ReadonlyArray<string | undefined>;
};

type ParentContext = {
	readonly path: string;
	readonly middleware: readonly RequestHandler[];
};

import { Router as ExpressRouter } from "express";
import { routerMetadata } from "./routerMetadata.js";
import type { Router, RouterConfig } from "./types.js";

/**
 * Creates an Express `Router` using the provided configuration and stores the
 * configuration for later inspection.
 *
 * @param config - The configuration used to create the router's routes.
 * @returns The new Express `Router` object.
 */
export function createRouter(config: RouterConfig) {
	const router: Router = ExpressRouter({ mergeParams: true });

	if (config.middleware && config.middleware.length > 0) {
		router.use(...config.middleware);
	}

	for (const [method, path, ...handlers] of config.routes) {
		router[method](path, ...handlers);
	}

	if (process.env["AC_EXPRESS_ROUTER_TRACKING"]) {
		router[routerMetadata] = { config };
	}

	return router;
}

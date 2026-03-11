import { Router as ExpressRouter } from "express";
import { routerMetadata } from "./routerMetadata.js";
import type { Router, RouterConfig } from "./types.js";

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

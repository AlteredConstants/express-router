import { routerMetadata } from "./routerMetadata.js";
import type { RequestHandler } from "./types.js";

/**
 * Sets a name to use for a request handler function when retrieving route
 * information instead of the `Function.name` property.
 *
 * This is primarily useful when working with dynamic functions or other
 * anonymous function patterns that don't include a name in the `Function.name`
 * property.
 *
 * @param handler - The handler to apply the custom name to.
 * @param name - The name to store with the handler.
 * @returns The same handler function.
 */
export function setRouteRequestHandlerName(
	handler: RequestHandler,
	name: string,
) {
	if (process.env["AC_EXPRESS_ROUTER_TRACKING"]) {
		handler[routerMetadata] = { ...handler[routerMetadata], name };
	}
	return handler;
}

import { routerMetadata } from "./routerMetadata.js";
import type { RequestHandler } from "./types.js";

export function setRouteRequestHandlerName(
	handler: RequestHandler,
	name: string,
) {
	if (process.env["AC_EXPRESS_ROUTER_TRACKING"]) {
		handler[routerMetadata] = { ...handler[routerMetadata], name };
	}
	return handler;
}

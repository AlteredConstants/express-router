import type {
	RequestHandler as ExpressRequestHandler,
	Router as ExpressRouter,
} from "express";
import type { routerMetadata } from "./routerMetadata.js";

/** The configuration of a router. */
export type RouterConfig = {
	/** Top-level middleware to apply first to all routes in the router. */
	readonly middleware?: readonly RequestHandler[];
	/** The routes to add to the router. */
	readonly routes: ReadonlyArray<ChildRouterConfig | RouteConfig>;
};

/**
 * A nested child router.
 *
 * @member method [0] - Must be `"use"` to declare a nested router.
 * @member path [1] - The path to nest all the child routes under.
 * @member router [2] - The router to nest.
 */
type ChildRouterConfig = readonly [method: "use", path: string, router: Router];

/**
 * A route configuration within a router.
 *
 * @member method [0] - The HTTP request method for the route to listen for.
 * @member path [1] - The path of the route within the router.
 * @member handlers [2+] - The middleware and handlers for processing the request.
 */
type RouteConfig = readonly [
	method: "get" | "post" | "put" | "patch" | "delete",
	path: string,
	...handlers: [RequestHandler, ...RequestHandler[]],
];

/** An Express router. */
export type Router = ExpressRouter & {
	[routerMetadata]?: { readonly config: RouterConfig };
};

/** An Express request handler. */
export type RequestHandler = ExpressRequestHandler & {
	[routerMetadata]?: { readonly name?: string };
};

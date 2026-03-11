import type {
	RequestHandler as ExpressRequestHandler,
	Router as ExpressRouter,
} from "express";
import type { routerMetadata } from "./routerMetadata.js";

export type RouterConfig = {
	readonly middleware?: RequestHandler[];
	readonly routes: ReadonlyArray<
		| readonly [method: "use", path: string, ExpressRouter]
		| readonly [
				method: "get" | "post" | "put" | "patch" | "delete",
				path: string,
				...RequestHandler[],
		  ]
	>;
};

export type Router = ExpressRouter & {
	[routerMetadata]?: { readonly config: RouterConfig };
};

export type RequestHandler = ExpressRequestHandler & {
	[routerMetadata]?: { readonly name?: string };
};

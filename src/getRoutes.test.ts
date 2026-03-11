import { expect, test } from "bun:test";
import { createRouter } from "./createRouter.js";
import { getRoutes, getRoutesGenerator } from "./getRoutes.js";
import { setRouteRequestHandlerName } from "./setRouteRequestHandlerName.js";

test("simple routes", () => {
	const router = createRouter({
		middleware: [function firstMiddleware() {}, function secondMiddleware() {}],
		routes: [
			[
				"get",
				"/api/foo",
				function firstFooHandler() {},
				function secondFooHandler() {},
			],
			["put", "/api/bar", function barHandler() {}],
		],
	});

	const routes = getRoutes(router);

	expect(routes).toEqual([
		{
			method: "GET",
			path: "/api/foo",
			handlerNames: [
				"firstMiddleware",
				"secondMiddleware",
				"firstFooHandler",
				"secondFooHandler",
			],
		},
		{
			method: "PUT",
			path: "/api/bar",
			handlerNames: ["firstMiddleware", "secondMiddleware", "barHandler"],
		},
	]);
});

test("nested routers", () => {
	const childRouter = createRouter({
		middleware: [function childMiddleware() {}],
		routes: [
			["post", "/one", function barOneHandler() {}],
			["delete", "/two", function barTwoHandler() {}],
		],
	});
	const parentRouter = createRouter({
		middleware: [function parentMiddleware() {}],
		routes: [
			["get", "/api/foo", function fooHandler() {}],
			["use", "/api/bar", childRouter],
		],
	});

	const routes = getRoutes(parentRouter);

	expect(routes).toEqual([
		{
			method: "GET",
			path: "/api/foo",
			handlerNames: ["parentMiddleware", "fooHandler"],
		},
		{
			method: "POST",
			path: "/api/bar/one",
			handlerNames: ["parentMiddleware", "childMiddleware", "barOneHandler"],
		},
		{
			method: "DELETE",
			path: "/api/bar/two",
			handlerNames: ["parentMiddleware", "childMiddleware", "barTwoHandler"],
		},
	]);
});

test("messy paths", () => {
	const router = createRouter({
		routes: [
			["get", "api///foo/", function fooHandler() {}],
			[
				"use",
				"/api/bar/",
				createRouter({ routes: [["get", "/nest/", function barHandler() {}]] }),
			],
			[
				"use",
				"/api/baz",
				createRouter({ routes: [["get", "nest", function bazHandler() {}]] }),
			],
		],
	});

	const routes = getRoutes(router);

	expect(routes).toEqual([
		{ method: "GET", path: "/api/foo", handlerNames: ["fooHandler"] },
		{ method: "GET", path: "/api/bar/nest", handlerNames: ["barHandler"] },
		{ method: "GET", path: "/api/baz/nest", handlerNames: ["bazHandler"] },
	]);
});

test("handler names", () => {
	function namedFunction() {}
	const anonymousFunction = function () {};
	const arrowFunction = () => {};
	const higherOrderFunction = () => () => {};
	const customNameFunction = setRouteRequestHandlerName(
		() => {},
		"Any value is valid!",
	);
	const router = createRouter({
		routes: [
			[
				"get",
				"/api/foo",
				namedFunction,
				anonymousFunction,
				arrowFunction,
				function () {},
				() => {},
				higherOrderFunction(),
				customNameFunction,
			],
		],
	});

	const routes = getRoutes(router);

	expect(routes).toEqual([
		{
			method: "GET",
			path: "/api/foo",
			handlerNames: [
				"namedFunction",
				"anonymousFunction",
				"arrowFunction",
				undefined,
				undefined,
				undefined,
				"Any value is valid!",
			],
		},
	]);
});

test("generator", () => {
	const childRouter = createRouter({
		middleware: [function childMiddleware() {}],
		routes: [
			["post", "/one", function barOneHandler() {}],
			["delete", "/two", function barTwoHandler() {}],
		],
	});
	const parentRouter = createRouter({
		middleware: [function parentMiddleware() {}],
		routes: [
			["get", "/api/foo", function fooHandler() {}],
			["use", "/api/bar", childRouter],
		],
	});

	const generator = getRoutesGenerator(parentRouter);

	expect(generator.next()).toEqual({
		done: false,
		value: {
			method: "GET",
			path: "/api/foo",
			handlerNames: ["parentMiddleware", "fooHandler"],
		},
	});
	expect(generator.next()).toEqual({
		done: false,
		value: {
			method: "POST",
			path: "/api/bar/one",
			handlerNames: ["parentMiddleware", "childMiddleware", "barOneHandler"],
		},
	});
	expect(generator.next()).toEqual({
		done: false,
		value: {
			method: "DELETE",
			path: "/api/bar/two",
			handlerNames: ["parentMiddleware", "childMiddleware", "barTwoHandler"],
		},
	});
	expect(generator.next()).toEqual({ done: true, value: undefined });
});

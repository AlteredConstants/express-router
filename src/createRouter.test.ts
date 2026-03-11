import { expect, mock, test } from "bun:test";
import express, { type RequestHandler } from "express";
import { createRouter } from "./createRouter.js";

test("creates correct router", async () => {
	const childMiddleware = mock<RequestHandler>((req, res, next) => next());
	const barGetHandler = mock<RequestHandler>((req, res) => res.send("Bar!"));
	const barPostHandler = mock<RequestHandler>((req, res) => res.send("Okay."));
	const childRouter = createRouter({
		middleware: [childMiddleware],
		routes: [
			["get", "/", barGetHandler],
			["post", "/", barPostHandler],
		],
	});

	const parentMiddleware = mock<RequestHandler>((req, res, next) => next());
	const fooMiddleware = mock<RequestHandler>((req, res, next) => next());
	const fooHandler = mock<RequestHandler>((req, res) => res.send("Foo!"));
	const parentRouter = createRouter({
		middleware: [parentMiddleware],
		routes: [
			["get", "/api/foo", fooMiddleware, fooHandler],
			["use", "/api/bar", childRouter],
		],
	});

	const server = express().use(express.text()).use(parentRouter).listen(9000);
	try {
		const fooResponse = await fetch("http://localhost:9000/api/foo");
		const fooText = await fooResponse.text();

		expect(fooResponse.status).toBe(200);
		expect(fooText).toBe("Foo!");
		expect(parentMiddleware).toHaveBeenCalledTimes(1);
		expect(fooMiddleware).toHaveBeenCalledTimes(1);
		expect(fooHandler).toHaveBeenCalledTimes(1);
		expect(childMiddleware).not.toHaveBeenCalled();
		expect(barGetHandler).not.toHaveBeenCalled();
		expect(barPostHandler).not.toHaveBeenCalled();

		mock.clearAllMocks();

		const barGetResponse = await fetch("http://localhost:9000/api/bar");
		const barGetText = await barGetResponse.text();

		expect(barGetResponse.status).toBe(200);
		expect(barGetText).toBe("Bar!");
		expect(parentMiddleware).toHaveBeenCalledTimes(1);
		expect(childMiddleware).toHaveBeenCalledTimes(1);
		expect(barGetHandler).toHaveBeenCalledTimes(1);
		expect(fooMiddleware).not.toHaveBeenCalled();
		expect(fooHandler).not.toHaveBeenCalled();
		expect(barPostHandler).not.toHaveBeenCalled();

		mock.clearAllMocks();

		const barPostResponse = await fetch("http://localhost:9000/api/bar", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: "Make bar.",
		});
		const barPostText = await barPostResponse.text();

		expect(barPostResponse.status).toBe(200);
		expect(barPostText).toBe("Okay.");
		expect(parentMiddleware).toHaveBeenCalledTimes(1);
		expect(childMiddleware).toHaveBeenCalledTimes(1);
		expect(barPostHandler).toHaveBeenCalledTimes(1);
		expect(barPostHandler).toHaveBeenCalledWith(
			expect.objectContaining({ body: "Make bar." }),
			expect.anything(),
			expect.anything(),
		);
		expect(fooMiddleware).not.toHaveBeenCalled();
		expect(fooHandler).not.toHaveBeenCalled();
		expect(barGetHandler).not.toHaveBeenCalled();
	} finally {
		server.close();
	}
});

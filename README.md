# Express Router With Route Inspection

In Express 5, [there is currently no way](https://github.com/expressjs/express/discussions/5961) to get access to the route information of a router from within the app or router objects themselves. This makes it essentially impossible to inspect all the routes in one place which is especially frustrating if they are spread across many nested routers and/or files.

This library provides a thin wrapper over the `Router` constructor from Express which makes it possible to track the route configuration for later logging.

## Installation

```shell
npm install @alteredconstants/express-router
```

You will also have to install Express if you haven't already.

```shell
npm install express
```

## Example

```javascript
// routes.js
import { createRouter } from "@alteredconstants/express-router";

// Define your middleware however you'd like.
const users = [{ id: 1, name: "Steve" }];
const products = [{ id: 1, name: "Golden Apple" }];
const validateUser = (req, res, next) => next();
const canUseProducts = (req, res, next) => next();
const canAddProduct = (req, res, next) => next();
const getUsers = (req, res) => res.send(users);
const getProducts = (req, res) => res.send(products);
const getProduct = (req, res) => res.send(product[0]);
const addProduct = (req, res) => res.send({ message: "Added!" });

// Create and compose routers together.
const productsRouter = createRouter({
	middleware: [canUseProducts],
	routes: [
		["get", "/", getProducts],
		["post", "/", canAddProduct, addProduct],
		["get", "/:id", getProduct],
	],
});
export const appRouter = createRouter({
	middleware: [validateUser],
	routes: [
		["get", "/api/users", getUsers],
		["use", "/api/products", productsRouter],
	],
});
```

```javascript
// index.js
import express from "express";
import { appRouter } from "./routes.js";

// Add the routers to your app.
const app = express();
app.use(appRouter);
```

Then, if you ever want to inspect your routes, you can write a simple script like:

```javascript
// print-routes.js
import { getRoutesGenerator } from "@alteredconstants/express-router";
import { appRouter } from "./routes.js";

// Or use `getRoutes` if you'd prefer an array.
for (const { method, path, handlerNames } of getRoutesGenerator(appRouter)) {
	console.log(method, path, `[${handlerNames.join(", ")}]`);
}
```

Then run the script with the `AC_EXPRESS_ROUTER_TRACKING` environment variable set to a non-empty value to enable the tracking (disabled by default):

```shell
AC_EXPRESS_ROUTER_TRACKING=true node print-routes.js
```

It will generate this output for this example:

```
GET /api/users [validateUser, getUsers]
GET /api/products [validateUser, canUseProducts, getProducts]
POST /api/products [validateUser, canUseProducts, canAddProduct, addProduct]
GET /api/products/:id [validateUser, canUseProducts, getProduct]
```

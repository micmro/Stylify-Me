// @ts-check

/* Module dependencies.*/
import http from "http";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import morgan from "morgan";
import serveStatic from "serve-static";
import compression from "compression";
import { getStylifyJsonHandler } from "./src/get-stylify-json.mjs";
import { getVersionHandler } from "./src/get-version.mjs";
import { validateReferer } from "./src/validateRefererMiddleware.mjs";
import { validateUrlParam } from "./src/validateUrlParam.mjs";

const app = express();
const dirPath = new URL(".", import.meta.url).pathname;

app.set("port", process.env.PORT || 5001);
app.use(compression());
app.use(morgan("short"));
app.use(bodyParser.json());
app.use(serveStatic(path.join(dirPath, "public")));
app.use(errorhandler());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send(
    500,
    { message: "Something's gone wrong! Please try to reload the page" }
  );
});

app.get("/", getVersionHandler);
app.get("/query", validateReferer, validateUrlParam, getStylifyJsonHandler);

http.createServer(app).listen(app.get("port"), () => {
  console.log(`Express server listening on port ${app.get("port")}`);
});

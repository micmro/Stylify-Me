// @ts-check

/* Module dependencies.*/
import http from "http";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import morgan from "morgan";
import serveFavicon from "serve-favicon";
import serveStatic from "serve-static";
import compression from "compression";
import { getStylifyJsonHandler } from "./src/get-stylify-json.mjs";
import { getPdfHandler } from "./src/get-pdf.mjs";
import { getRenderPdfViewHandler } from "./src/get-render-pdf-view.mjs";
import { getVersionHandler } from "./src/get-version.mjs";
import { validateReferer } from "./src/validateRefererMiddleware.mjs";
import { validateUrlParam } from "./src/validateUrlParam.mjs";

const app = express();

const dirPath = new URL(".", import.meta.url).pathname;

app.set("port", process.env.PORT || 5001);
app.use(compression());
app.use(morgan("short"));
app.set("views", dirPath + "/views");
app.set("view engine", "ejs");
app.use(serveFavicon(path.join(dirPath + "/public/favicon.ico")));
app.use(bodyParser.json());
app.use(serveStatic(path.join(dirPath, "public")));
app.use(errorhandler());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send(
    500,
    "<h1>Something's gone wrong!</h1><p>Please try to refresh the page</p>"
  );
});

/* Routes */
app.get("/", (req, res) => {
  res.redirect(301, "http://stylifyme.com/");
});

app.get("/about", (req, res) => {
  res.redirect(301, "http://stylifyme.com/about-us");
});

// renders html for PDF
app.get(
  "/renderpdfview",
  validateReferer,
  validateUrlParam,
  getRenderPdfViewHandler
);

// returns PDF file
app.get("/getpdf", validateReferer, validateUrlParam, getPdfHandler);

// returns stylify json
app.get("/query", validateReferer, validateUrlParam, getStylifyJsonHandler);

// returns phantom js version number
app.get("/version", getVersionHandler);

http.createServer(app).listen(app.get("port"), () => {
  console.log("Express server listening on port " + app.get("port"));
});

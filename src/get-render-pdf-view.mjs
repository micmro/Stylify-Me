// @ts-check
import childProcess from "child_process";
import { config } from "./config.mjs";
import { parsePhantomResponse } from "./utils.mjs";

/**
 * renders html for PDF
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const getRenderPdfViewHandler = (req, res) => {
  const showImage = true,
    debugMode = false;

  const url = req.query.url;

  let phantomProcess;
  const childArgs = [
    config.crawlerFilePath,
    url,
    "--local-url-access=false",
    "--ignore-ssl-errors=true",
    "--ssl-protocol=any",
    `--load-images=${showImage}`,
    `--debug=${debugMode}`,
  ];
  try {
    phantomProcess = childProcess.execFile(
      config.binPath,
      childArgs,
      { timeout: 25000 },
      (err, stdout, stderr) => {
        parsePhantomResponse(
          err,
          stdout,
          stderr,
          (jsonResponse) => {
            res.render("pdfbase", {
              title: "Stylify Me - Extract",
              pageUrl: url,
              data: jsonResponse,
            });
          },
          (errorMsg, errorCode) => {
            phantomProcess.kill();
            res
              .status(503)
              .jsonp({ error: errorMsg, errorCode: errorCode || "000" });
          }
        );
      }
    );
  } catch (err) {
    phantomProcess.kill();
    console.log("ERR:Could not create render pdf child process", url);
    res.status(503).jsonp({ error: "Eror creating pdf" });
  }
};

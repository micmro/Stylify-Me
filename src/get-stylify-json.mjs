// @ts-check
import childProcess from "child_process";
import { config } from "./config.mjs";
import { parsePhantomResponse } from "./utils.mjs";

/**
 * returns stylify json
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const getStylifyJsonHandler = (req, res) => {
  const referer = req.get("Referer") || "http://stylify.herokuapp.com",
    showImage = true,
    debugMode = false;

  const url = req.query.url;

  let phantomProcess;
  const childArgs = [
    "--ignore-ssl-errors=true",
    config.crawlerFilePath,
    url,
    `${showImage}`,
    `${debugMode}`,
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
            res.status(200).jsonp(jsonResponse);
          },
          (errorMsg, errorCode) => {
            phantomProcess.kill();
            res
              .status(200)
              .jsonp({ error: errorMsg, errorCode: errorCode || "000" });
          }
        );
      }
    );
  } catch (err) {
    phantomProcess.kill();
    console.log("ERR:Could not create child process" + err + "-" + url);
    res.status(200).jsonp({
      error:
        "Sorry, our server experiences a high load and the service is currently unavailable",
      errorCode: "503",
    });
  }
};

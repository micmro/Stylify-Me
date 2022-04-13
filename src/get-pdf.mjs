// @ts-check
import childProcess from "child_process";
import { config } from "./config.mjs";
import { deleteFile, makeFilename } from "./utils.mjs";

/**
 * returns stylify json
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const getPdfHandler = (req, res) => {
  let phantomProcess;

  const url = req.query.url;

  const filename =
    "public/pdf/temp" +
    makeFilename(url) +
    "_" +
    new Date().getTime().toString() +
    ".pdf";
  const childArgs = [
    config.rasterizeFilePath,
    req.protocol +
      "://" +
      req.get("host") +
      "/renderpdfview?url=" +
      encodeURIComponent(url),
    filename,
    "A4",
  ];
  try {
    phantomProcess = childProcess.execFile(
      config.binPath,
      childArgs,
      { timeout: 50000 },
      (err, stdout, stderr) => {
        console.log("LOG: CREATED PDF", filename);
        res.download(
          filename,
          "stylify-me " + makeFilename(url) + ".pdf",
          (err) => {
            deleteFile(filename);
            phantomProcess.kill();
          }
        );
      }
    );
  } catch (err) {
    phantomProcess.kill();
    console.log("ERR:Could not create get pdf child process", url);
    res.status(200).jsonp({
      error:
        "Sorry, our server experiences a high load and the service is currently unavailable",
      errorCode: "503",
    });
  }
};

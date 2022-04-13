// @ts-check

import childProcess from "child_process";
import { config } from "./config.mjs";

/**
 * returns phantom js version number
 * @type {import("express").RequestHandler}
 */
export const getVersionHandler = (req, res) => {
  const childArgs = ["--version"];
  let phantomProcess;
  try {
    phantomProcess = childProcess.execFile(
      config.binPath,
      childArgs,
      { timeout: 5000 },
      (err, stdout, stderr) => {
        res
          .status(200)
          .jsonp((err || stdout || stderr).toString().replace(/[\n\r]+/g, ""));
      }
    );
  } catch (err) {
    phantomProcess.kill();
  }
};

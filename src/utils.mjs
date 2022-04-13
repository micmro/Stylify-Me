// @ts-check
import path from "path";
import fs from "fs";
import { URL } from "url";
import { config } from "./config.mjs";

const dirPath = new URL(".", import.meta.url).pathname;

/**
 *
 * @param {string} filePath
 */
export const deleteFile = (filePath) => {
  try {
    fs.unlink(filePath, () => {
      console.log("file deleted", filePath);
    });
  } catch (e) {
    console.log("ERR:file delete error", e);
  }
};

/**
 *
 * @param {string} url
 * @returns
 */
export const makeFilename = (url) => {
  return url.replace(/https?:\/\//, "").replace(/[\/:/]/g, "_");
};

export const parsePhantomResponse = (
  err,
  stdout,
  stderr,
  onsuccess,
  onerror
) => {
  let jsonResponse = {};
  try {
    if (err || stderr) {
      console.log("ERR:PHANTOM>" + (stderr || err));
      onerror(stdout || err || "Error parsing site - please try again ", "111");
    } else if (
      stdout.indexOf("ERROR") === 0 ||
      stdout.indexOf("PHANTOM ERROR:") === 0
    ) {
      console.log("ERR:PHANTOM>" + stdout);

      const errorCode = stdout.match(/ERROR\((\d+)\)/)[1];
      switch (errorCode) {
        case "404":
          onerror(
            "Fail to load the current url - please make sure you don't have typos",
            errorCode
          );
          break;
        case "502":
          onerror(
            "Fail to parse site - the site might try to redirect or has invalid markup",
            errorCode
          );
          break;
        case "400":
          onerror(
            "Invalid url - please make sure you don't have typos",
            errorCode
          );
          break;
        default:
          onerror(
            stdout.replace("ERROR:", "").replace(/\r\n/, " ") || "error",
            errorCode || "000"
          );
      }
    } else if (stdout.indexOf("CONSOLE:") === 0) {
      jsonResponse = JSON.parse(stdout.replace(/(CONSOLE:).*[\n\r]/gi, ""));
      onsuccess(jsonResponse);
      //delete thumbnail after a bit
      setTimeout(
        deleteFile,
        config.screenshotCacheTime,
        path.join(dirPath, "public", jsonResponse.thumbPath)
      );
    } else {
      jsonResponse = JSON.parse(stdout);
      onsuccess(jsonResponse);

      //delete thumbnail after a bit
      setTimeout(
        deleteFile,
        config.screenshotCacheTime,
        path.join(dirPath, "public", jsonResponse.thumbPath)
      );
    }
  } catch (e) {
    console.log(e);
    onerror("Fail to parse response", "999");
  }
};

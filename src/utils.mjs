// @ts-check
import fs from "fs";

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

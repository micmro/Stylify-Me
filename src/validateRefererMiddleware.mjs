// @ts-check

import { config } from "./config.mjs";

/**
 * @param {string} referer
 * @param {string} currentPort
 * @returns
 */
const isRefererValid = (referer, currentPort) => {
  const validRefs = [...config.validRefs, `http://localhost:${currentPort}`];
  let isvalid = false;
  for (const valRef in validRefs) {
    if (referer.indexOf(validRefs[valRef]) == 0) {
      isvalid = true;
      return true;
    }
  }
  if (!isvalid) {
    console.log("ERR:Invalid referer:", referer);
  }
  return isvalid;
};

/**
 * Validates the referer
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const validateReferer = (req, res, next) => {
  const referer = req.get("Referer") || "http://stylify.herokuapp.com";
  if (isRefererValid(referer, req.app.get("port"))) {
    return next();
  }
  res.status(401).jsonp({ error: "Invalid referer" });
};

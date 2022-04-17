// @ts-check
import { URL } from "url";

/**
 *
 * @param {string} urlPath
 * @returns
 */
const isValidURL = (urlPath) => {
  let maybeUrl;
  try {
    maybeUrl = new URL(urlPath);
  } catch {
    return false;
  }
  if (!maybeUrl.hostname || !/http[s]?:/.test(maybeUrl.protocol)) {
    return false;
  }
  return true;
};

/**
 * Validated the `url` query parameter
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const validateUrlParam = (req, res, next) => {
  const url = req.query.url;
  if (url && isValidURL(url)) {
    return next();
  }
  console.log("ERR:Invalid or missing url parameter", url);
  res
    .status(200)
    .jsonp({ error: 'Invalid or missing "url" parameter', errorCode: "500" });
};

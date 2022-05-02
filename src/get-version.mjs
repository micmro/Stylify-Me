// @ts-check

import puppeteer from "puppeteer";
import { parsingConfig } from "./config.mjs";

/**
 * returns browser version number
 * @type {import("express").RequestHandler}
 */
export const getVersionHandler = async (req, res) => {
  try {
    const browser = await puppeteer.launch(parsingConfig.chromeOptions);
    const version = await browser.version();
    res.status(200).jsonp(version);
  } catch {
    res.status(500);
  }
};

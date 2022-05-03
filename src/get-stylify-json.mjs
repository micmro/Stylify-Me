// @ts-check
import puppeteer from "puppeteer";
import { parsingConfig } from "./config.mjs";
import { errorCodes } from "./errors.mjs";
import { queryPage, runPageParsing } from "./query-page.mjs";

/**
 * returns stylify json
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const getStylifyJsonHandler = async ({ query: { url } }, res) => {
  /** @type {puppeteer.Browser} */
  let browser;
  const cleanup = async () => {
    console.log(">>>> running cleanup");
    if (browser) {
      await browser.close();
    }
  };

  try {
    browser = await puppeteer.launch(parsingConfig.chromeOptions);

    const { page, error } = await queryPage(url, browser);
    if (error) {
      await cleanup();
      res.jsonp(error);
      return;
    }

    const parseResult = await runPageParsing(page).finally(async () => {
      await cleanup();
    });

    res.jsonp(parseResult);
  } catch (err) {
    cleanup();
    console.log("ERR:Error getting Stylify JSON", url);
    res.status(200).jsonp(errorCodes["503"]);
  }
};

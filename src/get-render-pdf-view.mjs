// @ts-check
import puppeteer from "puppeteer";
import { parsingConfig } from "./config.mjs";
import { errorCodes } from "./errors.mjs";
import { queryPage, runPageParsing } from "./query-page.mjs";

/**
 * renders html for PDF
 * @type {import("express").RequestHandler<undefined, any, any, {url?: string}>}
 */
export const getRenderPdfViewHandler = async ({ query: { url } }, res) => {
  /** @type {puppeteer.Browser} */
  let browser;
  const cleanup = async () => {
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

    res.render("pdfbase", {
      title: "Stylify Me - Extract",
      pageUrl: url,
      data: parseResult,
    });
  } catch (err) {
    cleanup();
    console.log("ERR:Error rendering PDF view", url, err);
    const { msg } = errorCodes["503-pdf-view"];
    res.status(503).end(msg);
  }
};

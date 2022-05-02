// @ts-check
import puppeteer from "puppeteer";
import { parsingConfig } from "./config.mjs";
import { errorCodes } from "./errors.mjs";
import { newPageWithUserAgent, queryPage } from "./query-page.mjs";
import { deleteFile, makeFilename } from "./utils.mjs";

/**
 * build URL to query for PDF view
 * @param {import("express").Request<undefined, any, any, {url: string}>} req
 */
const getRenderPdfViewUrl = (req) => {
  const {
    protocol,
    query: { url },
  } = req;
  return `${protocol}://${req.get(
    "host"
  )}/renderpdfview?url=${encodeURIComponent(url)}`;
};

/**
 * returns stylify json
 * @type {import("express").RequestHandler<undefined, any, any, {url: string}>}
 */
export const getPdfHandler = async (req, res) => {
  /** @type {puppeteer.Browser} */
  let browser;
  const url = req.query.url;
  /** @type{{ code: string; msg: string; }} */
  let error = undefined;
  const cleanup = async () => {
    console.log(">>>> getPdfHandler: running cleanup");
    if (browser) {
      await browser.close();
    }
  };

  try {
    const filename = `public/pdf/temp${makeFilename(url)}_${Date.now()}.pdf`;
    browser = await puppeteer.launch(parsingConfig.chromeOptions);
    const page = await newPageWithUserAgent(browser);
    await page.goto(getRenderPdfViewUrl(req)).catch((err) => {
      console.log(err);
      error = errorCodes["503-pdf"];
    });

    if (error) {
      await cleanup();
      res.header(error.code).json(error);
      return;
    }

    // wait for all images to load before rendering PDF
    await Promise.all([
      page.waitForSelector("#image-holder-1 img", { timeout: 5000 }),
      page.waitForSelector("#image-holder-2 img", { timeout: 5000 }),
      page.waitForSelector("#image-holder-3 img", { timeout: 5000 }),
      page.waitForSelector("#homepage-img-holder img", { timeout: 5000 }),
    ]).catch((err) => {
      // TODO: remove this later
      console.log("error waiting for images", err);
    });

    await page
      .pdf({
        path: filename,
        printBackground: true,
        format: "a4",
        timeout: 30000,
        margin: { top: "0.5cm", right: "1cm", bottom: "0.5cm", left: "1cm" },
      })
      .finally(async () => {
        await cleanup();
      });

    res.download(filename, `stylify-me ${makeFilename(url)}.pdf`, () => {
      deleteFile(filename); // delete file after download
    });
  } catch (err) {
    cleanup();
    console.log("ERR:Error rendering PDF", url, err);
    res.header(errorCodes["503-pdf"].code).json(errorCodes["503-pdf"]);
  }
};

// @ts-check

import { errorCodes } from "./errors.mjs";
import { config, parsingConfig } from "./config.mjs";
import { parsePage } from "./parse-page.mjs";
import { deleteFile, makeFilename } from "./utils.mjs";

/**
 * Create a screenshot of the page
 * @param {import("puppeteer").Page} page
 *
 * @returns {Promise<string>} path to the screenshot taken
 */
const takeScreenShot = async (page) => {
  const imgPath = `${config.tempImgPath}${makeFilename(
    page.url()
  )}_${Date.now()}${Math.floor(Math.random() * 10000)}.png`;

  await page.screenshot({ path: imgPath, fullPage: true }).catch((err) => {
    console.error("error taking screenshot", err);
  });

  setTimeout(() => {
    deleteFile(imgPath);
  }, config.screenshotCacheTime);

  return imgPath;
};

/**
 * Create page and set user Agent
 * @param {import("puppeteer").Browser} browser
 */
export const newPageWithUserAgent = async (browser) => {
  const page = await browser.newPage();
  // do not reveal this is a headless chrome,
  // as many sites block requests from headless UAs
  await page.setUserAgent(
    await browser
      .userAgent()
      .then((ua) => ua.replace("HeadlessChrome", "Chrome"))
  );
  return page;
};

/**
 * goto, fetch and validate `url`
 *
 * @param {string} url url to fetch
 * @param {import("puppeteer").Browser} browser
 *
 * @returns {Promise<{page: import("puppeteer").Page; error?: { code: string; msg: string; }; }>}
 */
export const queryPage = async (url, browser) => {
  const page = await newPageWithUserAgent(browser);
  /** @type{{ code: string; msg: string; }} */
  let error = undefined;

  await page
    .goto(url, { waitUntil: "networkidle0" })
    .then(async (resp) => {
      if (resp.status() === 404) {
        const plainBody = await page.content();
        if (plainBody.length === 0) {
          error = errorCodes["404"];
        }
      }
    })
    .catch(() => {
      error = errorCodes[404];
    });

  // force lazy loading
  // https://github.com/puppeteer/examples/blob/master/lazyimages_without_scroll_events.js
  await page
    .evaluate(() => {
      // const viewPortHeight = document.documentElement.clientHeight;
      let lastScrollTop = document.scrollingElement.scrollTop;
      // Scroll to bottom of page until we can't scroll anymore.
      const scroll = () => {
        document.scrollingElement.scrollTop += 1024 / 2;
        if (document.scrollingElement.scrollTop !== lastScrollTop) {
          lastScrollTop = document.scrollingElement.scrollTop;
          requestAnimationFrame(scroll);
        } else {
          // return to top
          document.scrollingElement.scrollTop = 0;
        }
      };
      scroll();
    })
    .catch((err) => console.error("page scroll error", err));
  await page.waitForNetworkIdle({ idleTime: 100 });

  return { page, error };
};

/**
 * Parse the page, takes a screenshot and combines all JSON response object
 *
 * Returns a JSON error object in case of errors
 *
 * @param {import("puppeteer").Page} page
 */
export const runPageParsing = async (page) => {
  const result = await Promise.all([
    page.evaluate(parsePage).catch(() => errorCodes["502"]),
    takeScreenShot(page),
  ])
    .then(([parseResult, screenshotPath]) => {
      const thumbPath =
        typeof screenshotPath === "string"
          ? screenshotPath.replace("public/", "")
          : undefined;
      return {
        ...parseResult,
        thumbPath,
      };
    })
    .catch(() => errorCodes["500"]);
  return result;
};

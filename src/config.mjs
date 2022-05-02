// @ts-check
import phantomjs from "phantomjs-prebuilt";

/* Variables / Config */
export const config = {
  tempImgPath: "public/temp-img/",
  binPath: phantomjs.path,
  crawlerFilePath: "stylify-crawler.js",
  rasterizeFilePath: "phantom-rasterize.js",
  screenshotCacheTime: 5000, //in ms (1000ms = 1 sec)
};

/**
 * @type {import("puppeteer").LaunchOptions & import("puppeteer").LaunchOptions & import("puppeteer").BrowserLaunchArgumentOptions & import("puppeteer").BrowserConnectOptions}
 */
const chromeOptions = {
  headless: true,
  defaultViewport: {
    width: 1280,
    height: 1024,
    deviceScaleFactor: 1,
  },
  args: [
    "--incognito",
    "--no-sandbox",
    "--single-process",
    "--no-zygote",
    "--enable-automation",
  ],
};

export const parsingConfig = {
  chromeOptions,
};

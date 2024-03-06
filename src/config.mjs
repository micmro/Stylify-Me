// @ts-check

/* Variables / Config */
export const config = {
  tempImgPath: "public/temp-img/",
  crawlerFilePath: "stylify-crawler.js",
  screenshotCacheTime: 5000, //in ms (1000ms = 1 sec)
  validRefs: [
    "http://stylifyme.com",
    "http://www.stylifyme.com",
    "http://api.stylifyme.com",
    "http://stylify.herokuapp.com",
    "http://localhost:9185",
    "http://localhost:7210",
  ],
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

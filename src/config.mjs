// @ts-check
import phantomjs from "phantomjs-prebuilt";

/* Variables / Config */
export const config = {
  binPath: phantomjs.path,
  crawlerFilePath: "stylify-crawler.js",
  rasterizeFilePath: "phantom-rasterize.js",
  screenshotCacheTime: 5000 * 1, //in ms (1000ms = 1 sec)
};

export const parsingConfig = {
  // tempImgPath: "public/temp-img/",
  jQueryPath: "lib/jquery-2.1.1.min.js",
  //pretend to be Safari 9 - (similar engine as PhantomJS) change this if you want to pretend to be another browser
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/601.1.56 (KHTML, like Gecko) Version/9.0 Safari/537.86.1",
};

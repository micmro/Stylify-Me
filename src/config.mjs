// @ts-check
import phantomjs from "phantomjs-prebuilt";

/* Variables / Config */
export const config = {
  binPath: phantomjs.path,
  crawlerFilePath: "stylify-crawler.js",
  rasterizeFilePath: "phantom-rasterize.js",
  screenshotCacheTime: 5000 * 1, //in ms (1000ms = 1 sec)
};

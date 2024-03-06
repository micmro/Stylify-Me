import { jest, expect, describe, beforeEach, test } from "@jest/globals";
import { deleteFile, makeFilename } from "../utils.mjs";

describe("utils", () => {
  beforeEach(() => {
    jest.mock("fs");
  });

  test.each([
    ["http://stylifyme.com", "stylifyme_com"],
    ["http://www.stylifyme.com", "www_stylifyme_com"],
    ["http://stylify.herokuapp.com", "stylify_herokuapp_com"],
    ["http://api.stylifyme.com", "api_stylifyme_com"],
    ["https://google.com", "google_com"],
    [`http://localhost:4000`, `localhost_4000`],
  ])("accepts %s", (url, result) => {
    expect.assertions(1);
    expect(makeFilename(url)).toBe(result);
  });
});

import { jest, expect, describe, beforeEach, test } from "@jest/globals";
import { deleteFile, makeFilename } from "../utils.mjs";

describe("utils", () => {
  beforeEach(() => {
    jest.mock("fs");
  });

  test.each([
    ["http://stylifyme.com", "stylifyme.com"],
    ["http://www.stylifyme.com", "www.stylifyme.com"],
    ["http://api.stylifyme.com", "api.stylifyme.com"],
    ["https://google.com", "google.com"],
    [`http://localhost:4000`, `localhost_4000`],
  ])("accepts %s", (url, result) => {
    expect.assertions(1);
    expect(makeFilename(url)).toBe(result);
  });
});

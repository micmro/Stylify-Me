import { jest, expect, describe, beforeEach, test } from "@jest/globals";
import { validateReferer } from "../validateRefererMiddleware.mjs";

describe("validateRefererMiddleware", () => {
  let statusSpy, jsonpSpy, nextSpy, mockReq, mockRes;
  let referer = "http://stylify.herokuapp.com";

  beforeEach(() => {
    jsonpSpy = jest.fn();
    statusSpy = jest.fn().mockImplementation(() => ({ jsonp: jsonpSpy }));
    nextSpy = jest.fn();
    mockReq = {
      get: () => referer,
      app: {
        get: () => "4000",
      },
    };
    mockRes = {
      status: statusSpy,
    };
  });
  test("works for default referrer", () => {
    expect.assertions(3);
    referer = undefined;
    validateReferer(mockReq, mockRes, nextSpy);
    expect(nextSpy).toHaveBeenCalled();
    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonpSpy).not.toHaveBeenCalled();
  });

  test.each([
    ["http://stylifyme.com"],
    ["http://www.stylifyme.com"],
    ["http://stylify.herokuapp.com"],
    ["http://api.stylifyme.com"],
    ["http://localhost:9185"],
    ["http://localhost:7210"],
    [`http://localhost:4000`],
  ])("accepts %s", (url) => {
    expect.assertions(3);
    referer = url;
    validateReferer(mockReq, mockRes, nextSpy);
    expect(nextSpy).toHaveBeenCalled();
    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonpSpy).not.toHaveBeenCalled();
  });

  test.each([
    ["http://stylifyme"],
    ["http://www.stylifyyou.com"],
    ["http://goolge.com"],
    ["http://localhost:999"],
  ])("rejects %s", (url) => {
    expect.assertions(3);
    jest.spyOn(console, "log").mockImplementation();
    referer = url;
    validateReferer(mockReq, mockRes, nextSpy);
    expect(nextSpy).not.toHaveBeenCalled();
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonpSpy).toHaveBeenCalledWith({ error: "Invalid referer" });
  });
});

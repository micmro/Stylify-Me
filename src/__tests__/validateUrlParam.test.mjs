import { jest, expect, describe, beforeEach, test } from "@jest/globals";
import { validateUrlParam } from "../validateUrlParam.mjs";

describe("validateUrlParam", () => {
  let statusSpy, jsonpSpy, nextSpy, mockRes;

  beforeEach(() => {
    jsonpSpy = jest.fn();
    statusSpy = jest.fn().mockImplementation(() => ({ jsonp: jsonpSpy }));
    nextSpy = jest.fn();
    mockRes = { status: statusSpy };
  });

  test.each([
    ["http://stylifyme.com"],
    ["http://www.stylifyme.com"],
    ["http://api.stylifyme.com"],
    ["https://google.com"],
    [`http://localhost:4000`],
  ])("accepts %s", (url) => {
    expect.assertions(3);
    const mockReq = { query: { url } };
    validateUrlParam(mockReq, mockRes, nextSpy);
    expect(nextSpy).toHaveBeenCalled();
    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonpSpy).not.toHaveBeenCalled();
  });

  test.each([
    ["undefined", undefined],
    ["empty string", ""],
    ["no hostname", "http://"],
    ["wrong protocol", "ftp://test.com"],
  ])("rejects %s", (_, url) => {
    expect.assertions(3);
    jest.spyOn(console, "log").mockImplementation();
    const mockReq = { query: { url } };
    validateUrlParam(mockReq, mockRes, nextSpy);
    expect(nextSpy).not.toHaveBeenCalled();
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonpSpy).toHaveBeenCalledWith({
      error: 'Invalid or missing "url" parameter',
      errorCode: "500",
    });
  });
});

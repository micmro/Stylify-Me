/**
 * @jest-environment jsdom
 */
import { parsePage } from "../parse-page.mjs";

describe("parsePage", () => {
  test("smoke test", () => {
    expect(parsePage()).toEqual({
      "a-text-colour": "N/A",
      "background-colour": "N/A",
      "background-img": "N/A",
      coloursBg: [],
      coloursText: [],
      "img-paths": [],
      "main-background-colour": "N/A",
      "p-text-colour": "N/A",
      title: "",
      typography: {
        body: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Body",
          "text-colour": "N/A",
        },
        h1: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Header 1",
          "text-colour": "N/A",
        },
        h2: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Header 2",
          "text-colour": "N/A",
        },
        h3: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Header 3",
          "text-colour": "N/A",
        },
        h4: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Header 4",
          "text-colour": "N/A",
        },
        h5: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Header 5",
          "text-colour": "N/A",
        },
        h6: {
          font: "N/A",
          "font-size": "N/A",
          "font-style": "N/A",
          leading: "N/A",
          name: "Header 6",
          "text-colour": "N/A",
        },
      },
    });
  });
});

// @ts-check

/**
 * Analyze the styling of the page
 *
 * _needs to be a single closure to be injectable by pupeteer_
 */
export const parsePage = () => {
  //define methods needed for parsing
  const hexRegEx = new RegExp(/^#[0-9a-f]{3,6}$/i);

  /**
   * convert RGB colors to Hex (`rgb(255, 255, 255))` to `#FFFFFF`)
   * @param {string} rgb
   * @returns {string}
   */
  const rgb2hex = (rgb) => {
    if (!rgb || rgb.indexOf("rgb") != 0) {
      return rgb || "-";
    }
    let rgbArr = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (!rgbArr) {
      rgbArr = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
    }
    const hex = (x) => {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    };
    if (rgbArr && rgbArr[4] && rgbArr[4] == "0") {
      return "transparent";
    } else if (rgbArr) {
      return "#" + hex(rgbArr[1]) + hex(rgbArr[2]) + hex(rgbArr[3]);
    } else {
      return "ERR";
    }
  };

  /**
   * Extract font-relates styles from `el`
   * @param {Element} el
   * @param {string} name
   */
  const getTypeSet = (el, name) => {
    const styles = el ? window.getComputedStyle(el) : {};
    return {
      name: name,
      "text-colour": rgb2hex(styles.color || naMsg),
      font: styles.fontFamily || naMsg,
      "font-size": styles.fontSize || naMsg,
      leading: styles.lineHeight || naMsg,
      "font-style": styles.fontStyle || naMsg,
    };
  };

  /**
   * Order `colourArr` and prepend `prependValueArr` if set.
   * @param {Array<[string, string]>} colourArr
   * @param {string[]} prependValueArr
   * @returns
   */
  const orderColourResponse = (colourArr = [], prependValueArr = []) => {
    let sortedColourArr = colourArr.sort((a, b) => {
      return b[1] < a[1] ? -1 : b[1] > a[1] ? 1 : 0;
    });

    // return prependValueArr;
    prependValueArr.forEach((el, i) => {
      let prependIndex = sortedColourArr.findIndex((n) => n[0] === el) || 0;
      if (prependIndex <= 0) {
        return;
      }
      sortedColourArr = [
        sortedColourArr[prependIndex],
        ...sortedColourArr.filter((_, i) => i !== prependIndex),
      ];
    });
    return sortedColourArr;
  };

  //define vars needed for parsing
  var images = document.images;
  var imgPaths = [];
  var img1, img2, img3;

  /**
   * helper to get the computed `style` of `el`
   * @param {Element} el
   * @param {keyof CSSStyleDeclaration} style
   * @return {any} // depends on `style`
   */
  const getStyle = (el, style) => {
    if (!el) {
      return;
    }

    return window.getComputedStyle(el)[style];
  };

  //select base elemts to run selectors from
  const baseSelector =
    document.querySelector("[role=main]") ||
    document.querySelector("#main") ||
    document.querySelector("#content") ||
    document.body;

  /**
   * Helper to query html elements from `baseSelector` or `document`
   * @param {string} query
   * @returns {HTMLElement}
   */
  const getElementOrFallback = (query) =>
    baseSelector.querySelector(query) || document.querySelector(query);

  const h1 = getElementOrFallback("h1");
  const h2 = getElementOrFallback("h2");
  const h3 = getElementOrFallback("h3");
  const h4 = getElementOrFallback("h4");
  const h5 = getElementOrFallback("h5");
  const h6 = getElementOrFallback("h6");
  const p = getElementOrFallback("p");
  const a = getElementOrFallback("a");
  const body = document.body;
  const naMsg = "N/A";

  let coloursBgReturn = [];
  let coloursTextReturn = [];
  let colourAttributes = {};
  let colour;
  let colourOccurrences = {};

  //select images to return
  if (images.length >= 3) {
    const middle = Math.floor(images.length / 2);
    img1 = images[middle - 1];
    img2 = images[middle];
    img3 = images[middle + 1];
    imgPaths.push({ src: img1.src, w: img1.width, h: img1.height });
    imgPaths.push({ src: img2.src, w: img2.width, h: img2.height });
    imgPaths.push({ src: img3.src, w: img3.width, h: img3.height });
  } else {
    imgPaths.concat(
      Array.from(images).map((el) => ({
        src: el.src,
        w: el.width,
        h: el.height,
      }))
    );
  }

  //iterate through every element
  document.querySelectorAll("*").forEach((el) => {
    colour = null;
    ["color", "backgroundColor"].forEach((prop) => {
      //if we can't find this property or it's null, continue
      // @ts-ignore
      if (!getStyle(el, prop)) {
        return true;
      }
      //create RGBColor object
      // @ts-ignore
      colour = rgb2hex(getStyle(el, prop));

      if (colourAttributes[colour]) {
        colourAttributes[colour][prop] =
          (colourAttributes[colour][prop] || 0) + 1;
        colourAttributes[colour].count = colourAttributes[colour].count + 1;
        colourOccurrences[prop] = (colourOccurrences[prop] || 0) + 1;
      } else if (hexRegEx.test(colour)) {
        colourAttributes[colour] = { count: 1 };
        colourAttributes[colour][prop] = 1;
        colourOccurrences[prop] = (colourOccurrences[prop] || 0) + 1;
      }
    });
  });

  Object.entries(colourAttributes).forEach(([hex, attr]) => {
    if (attr["color"] || 0 > 0) {
      coloursTextReturn.push([hex, attr["color"]]);
    }
    if (attr["backgroundColor"] || 0 > 0) {
      coloursBgReturn.push([hex, attr["backgroundColor"]]);
    }
  });

  coloursTextReturn = orderColourResponse(coloursTextReturn, [
    rgb2hex(getStyle(baseSelector, "color")),
  ]);
  coloursBgReturn = orderColourResponse(coloursBgReturn, [
    rgb2hex(getStyle(document.body, "backgroundColor")),
    rgb2hex(getStyle(baseSelector, "backgroundColor")),
  ]);

  //return result object
  return {
    title: document.title,
    colors: {
      histogram: colourOccurences,
      text_histogram: coloursTextReturn,
      background_histogram: coloursBgReturn,
      text: rgb2hex(getStyle(p, "color") || naMsg),
      link: rgb2hex(getStyle(a, "color") || naMsg),
      "main-background": rgb2hex(getStyle(baseSelector, "backgroundColor") || naMsg),
      "body-background": rgb2hex(getStyle(body, "backgroundColor") || naMsg),
    },
    typographies: {
      h1: getTypeSet(h1, "Header 1"),
      h2: getTypeSet(h2, "Header 2"),
      h3: getTypeSet(h3, "Header 3"),
      h4: getTypeSet(h4, "Header 4"),
      h5: getTypeSet(h5, "Header 5"),
      h6: getTypeSet(h6, "Header 6"),
      body: getTypeSet(baseSelector, "Body"),
    },
    "background-img": getStyle(body, "backgroundImage") || naMsg,
    "img-paths": imgPaths || naMsg,
  };
};

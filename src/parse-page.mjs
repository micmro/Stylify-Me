// @ts-check

/** analyze the styling of the page */
export function parsePage() {
  //run jQuery in compatibility mode as $jq
  // @ts-ignore
  var $jq = window.jQuery;
  $jq.noConflict();
  $jq.fn.exists = function () {
    if (this.length > 0) {
      return this;
    } else {
      return false;
    }
  };

  //define methods needed for parsing
  var hexRegEx = new RegExp(/^#[0-9a-f]{3,6}$/i);
  var rgb2hex = function (rgb) {
    if (!rgb || rgb.indexOf("rgb") != 0) {
      return rgb || "-";
    }
    var rgbArr = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (!rgbArr) {
      rgbArr = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
    }
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    if (rgbArr && rgbArr[4] && rgbArr[4] == "0") {
      return "transparent";
    } else if (rgbArr) {
      return "#" + hex(rgbArr[1]) + hex(rgbArr[2]) + hex(rgbArr[3]);
    } else {
      return "ERR";
    }
  };
  var getTypeSet = function (el, name) {
    return {
      name: name,
      "text-colour": rgb2hex(el.css("color") || naMsg),
      font: el.css("font-family") || naMsg,
      "font-size": el.css("font-size") || naMsg,
      leading: el.css("line-height") || naMsg,
      "font-style": el.css("font-style") || naMsg,
    };
  };
  var orderColourResponse = function (colourArr, prependValueArr) {
    colourArr = (colourArr || []).sort(function (a, b) {
      return b[1] < a[1] ? -1 : b[1] > a[1] ? 1 : 0;
    });

    $jq.each(prependValueArr, function (i, el) {
      var from =
        $jq.map(colourArr, function (n, j) {
          return n[0] == el ? j : null;
        })[0] || 0;
      colourArr.splice(i, 0, colourArr.splice(from, 1)[0]);
    });
    return colourArr;
  };

  //define vars needed for parsing
  var images = $jq(document.images);
  var imgPaths = [];
  var img1, img2, img3;

  //select base elemts to run selectors from
  var baseSelector =
    $jq("[role=main]").exists() ||
    $jq("#main").exists() ||
    $jq("#content").exists() ||
    $jq(document.body);
  var h1 = baseSelector.find("h1:first").exists() || $jq("h1:first");
  var h2 = baseSelector.find("h2:first").exists() || $jq("h2:first");
  var h3 = baseSelector.find("h3:first").exists() || $jq("h3:first");
  var h4 = baseSelector.find("h4:first").exists() || $jq("h4:first");
  var h5 = baseSelector.find("h5:first").exists() || $jq("h5:first");
  var h6 = baseSelector.find("h6:first").exists() || $jq("h6:first");
  var p = baseSelector.find("p:first").exists() || $jq("p:first");
  var a = baseSelector.find("a:first").exists() || $jq("a:first");
  var body = $jq(document.body);
  var naMsg = "N/A";

  var coloursBgReturn = [],
    coloursTextReturn = [];
  var colourAttributes = {},
    result = {};
  var colour;
  var colourOccurences = {};

  //select images to return
  if (images.length >= 3) {
    img1 = images[images.length / 2 - 1];
    img2 = images[images.length / 2];
    img3 = images[images.length / 2 + 1];

    imgPaths.push({ src: img1.src, w: img1.width, h: img1.height });
    imgPaths.push({ src: img2.src, w: img2.width, h: img2.height });
    imgPaths.push({ src: img3.src, w: img3.width, h: img3.height });
  } else {
    $jq(images).each(function (i, el) {
      imgPaths.push({ src: el.src, w: el.width, h: el.height });
    });
  }

  //iterate through every element
  $jq("*").each(function (i, el) {
    colour = null;
    el = $jq(el);
    $jq.each(["color", "background-color"], function (j, prop) {
      //if we can't find this property or it's null, continue
      if (!el.css(prop)) {
        return true;
      }
      //create RGBColor object
      colour = rgb2hex(el.css(prop));

      if (colourAttributes[colour]) {
        colourAttributes[colour][prop] =
          (colourAttributes[colour][prop] || 0) + 1;
        colourAttributes[colour].count = colourAttributes[colour].count + 1;
        colourOccurences[prop] = (colourOccurences[prop] || 0) + 1;
      } else if (hexRegEx.test(colour)) {
        colourAttributes[colour] = { count: 1 };
        colourAttributes[colour][prop] = 1;
        colourOccurences[prop] = (colourOccurences[prop] || 0) + 1;
      }
    });
  });

  var trace = [];
  $jq.each(colourAttributes, function (hex, attr) {
    if (attr["color"] || 0 > 0) {
      coloursTextReturn.push([hex, attr["color"]]);
    }
    if (attr["background-color"] || 0 > 0) {
      coloursBgReturn.push([hex, attr["background-color"]]);
    }
  });

  coloursTextReturn = orderColourResponse(coloursTextReturn, [
    rgb2hex(baseSelector.css("color")),
  ]);
  coloursBgReturn = orderColourResponse(coloursBgReturn, [
    rgb2hex(body.css("background-color")),
    rgb2hex(baseSelector.css("background-color")),
  ]);

  //return result object
  return {
    title: document.title,
    //, "colourOccurences" : colourOccurences
    coloursText: coloursTextReturn,
    coloursBg: coloursBgReturn,
    typography: {
      h1: getTypeSet(h1, "Header 1"),
      h2: getTypeSet(h2, "Header 2"),
      h3: getTypeSet(h3, "Header 3"),
      h4: getTypeSet(h4, "Header 4"),
      h5: getTypeSet(h5, "Header 5"),
      h6: getTypeSet(h6, "Header 6"),
      body: getTypeSet(baseSelector, "Body"),
    },

    "p-text-colour": rgb2hex(p.css("color") || naMsg),
    "a-text-colour": rgb2hex(a.css("color") || naMsg),
    "main-background-colour": rgb2hex(
      baseSelector.css("background-color") || naMsg
    ),
    "background-img": body.css("background-image") || naMsg,
    "background-colour": rgb2hex(body.css("background-color") || naMsg),
    "img-paths": imgPaths || naMsg,
  };
}

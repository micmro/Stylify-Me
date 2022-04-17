export const errorCodes = {
  400: {
    code: "400",
    msg: "Invalid url - please make sure you don't have typos",
  },
  404: {
    code: "404",
    msg: "Fail to load the current url - please make sure you don't have typos",
  },
  502: {
    code: "502",
    msg: "Fail to parse site - the site might try to redirect or has invalid markup",
  },
  503: {
    code: "503",
    msg: "Sorry, our server experiences a high load and the service is currently unavailable",
  },
};

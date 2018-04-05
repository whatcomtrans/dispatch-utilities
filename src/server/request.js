import fetch from "node-fetch";
import { parseString } from "xml2js";

const aimServerBaseUrl = "http://aim.whatcomtrans.net";

function buildQueryString(parameters) {
  return Object.keys(parameters).reduce((acc, cur, idx, arr) => {
    return `${acc}${encodeURIComponent(cur)}=${encodeURIComponent(
      parameters[cur]
    )}${idx < arr.length - 1 ? "&" : ""}`;
  }, "?");
}

async function fetchXmlToJs(url) {
  const response = await fetch(url);
  let json;
  parseString(await response.text(), { explicitArray: false }, (err, res) => {
    json = res;
  });
  return json;
}

export async function login(query) {
  const response = (await fetchXmlToJs(
    `${aimServerBaseUrl}/api/${buildQueryString({
      method: "login",
      v: 6,
      ...query,
    })}`
  ))["api_response"];

  if (response.success === "0") {
    throw response.errors.error.msg;
  }

  return response;
}

export async function getDevices(query) {
  const response = (await fetchXmlToJs(
    `${aimServerBaseUrl}/api/${buildQueryString({
      method: "get_devices",
      v: 6,
      ...query,
    })}`
  ))["api_response"];

  return response;
}

export async function getChannels(query) {
  const response = (await fetchXmlToJs(
    `${aimServerBaseUrl}/api/${buildQueryString({
      method: "get_channels",
      v: 6,
      ...query,
    })}`
  ))["api_response"];

  return response;
}

import socketIO from "socket.io";
import logger from "./logger.js";
import { login, getDevices, getChannels } from "./request";

let token = null;
const consoleClipboardHistories = {};

export async function setupClipboard(server) {
  const io = socketIO(server, { wsEngine: "ws" });
  const clipboardSpace = io.of("clipboard");

  token = await getAuthToken();

  clipboardSpace.on("connection", async socket => {
    const channel = decodeURIComponent(socket.handshake.query.channel);

    logger.info("Websocket connection", {
      channel,
      version: decodeURIComponent(socket.handshake.query.version),
    });

    socket.on("clipboard", async ({ clipboard }) => {
      logger.info("Copy", { channel, text: clipboard.text });
      const rxsInConsole = await getReceiversInConsole(channel, token);
      const consoleLocation = rxsInConsole[0].d_location;

      consoleClipboardHistories[consoleLocation] = addToConsoleClipboardHistory(
        clipboard,
        consoleClipboardHistories[consoleLocation]
      );

      clipboardSpace.emit("clipboard", {
        channels: rxsInConsole.map(rx => rx.c_name).filter(x => x !== channel),
        clipboardHistory: consoleClipboardHistories[consoleLocation],
      });
    });
  });
}

export async function getChannelWithRetry(compName) {
  return await retryOnAuthError(getChannel, { compName, token });
}

export async function getDeviceLocationWithRetry(channel) {
  return await retryOnAuthError(getDeviceLocation, { channel, token });
}

export async function clearClipboardHistory(channel) {
  const location = await retryOnAuthError(getDeviceLocation, {
    channel,
    token,
  });
  consoleClipboardHistories[location] = [];
}

async function retryOnAuthError(fn, params = {}) {
  try {
    return await fn(params);
  } catch (error) {
    if (error === "Login required") {
      token = await getAuthToken();
    }
    return await fn(params);
  }
}

async function getChannel(params) {
  const { compName, token } = params;
  let channels;
  try {
    const response = await getChannels({
      device_type: "tx",
      filter_c_description: compName,
      token,
    });
    channels = response.channels;
  } catch (error) {
    logger.error("getChannel", { error });
    throw error;
  }

  if (!channels) {
    logger.error("No channel for computer specified", { compName });
    return null;
  }

  return channels.channel.c_name;
}

async function getDeviceLocation(params) {
  const { channel, token } = params;
  let rxs;
  try {
    const response = await getDevices({ token });
    rxs = response.devices;
  } catch (error) {
    logger.error("getDeviceLocation", { error });
    throw error;
  }

  const rx = rxs.device.find(rx => rx.c_name === channel);

  if (!rx) {
    logger.error("No receiver for channel", { channel });
  }

  return rx.d_location;
}

async function getReceiversInConsole(channel, token) {
  let rxs;
  try {
    const response = await getDevices({ token });
    rxs = response.devices;
  } catch (error) {
    logger.error(error);
    throw error;
  }

  const rx = rxs.device.find(rx => rx.c_name === channel);

  if (!rx) {
    logger.error("No receiver for channel", { channel });
  }

  return rxs.device.filter(r => r.d_location === rx.d_location);
}

async function getAuthToken() {
  try {
    const response = await login({
      username: process.env.AIM_USERNAME,
      password: process.env.AIM_PASSWORD,
    });

    logger.info("Login succeeded", { token: response.token });

    return response.token;
  } catch (error) {
    logger.error("Login failed", { error });
  }
}

function addToConsoleClipboardHistory(clipboardState, consoleClipboardHistory) {
  let newConsoleClipboardHistory = consoleClipboardHistory
    ? [...consoleClipboardHistory]
    : [];

  const existing = newConsoleClipboardHistory.findIndex(
    clipboardItem =>
      clipboardState.text === clipboardItem.text &&
      clipboardState.html === clipboardItem.html &&
      clipboardState.rtf === clipboardItem.rtf &&
      clipboardState.image === clipboardItem.image
  );

  if (existing !== -1) {
    newConsoleClipboardHistory = [
      clipboardState,
      ...newConsoleClipboardHistory.slice(0, existing),
      ...newConsoleClipboardHistory.slice(existing + 1),
    ];
  } else {
    newConsoleClipboardHistory.unshift(clipboardState);

    if (newConsoleClipboardHistory.length > 5) {
      newConsoleClipboardHistory = newConsoleClipboardHistory.slice(0, 6);
    }
  }

  return newConsoleClipboardHistory;
}

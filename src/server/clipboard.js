import socketIO from "socket.io";
import logger from "./logger.js";
import { login, getDevices, getChannels } from "./request";

export let token = null;
const consoleClipboardHistories = {};

export function setupClipboard(server) {
  const io = socketIO(server, { wsEngine: "ws" });
  const clipboardSpace = io.of("clipboard");

  login({
    username: process.env.AIM_USERNAME,
    password: process.env.AIM_PASSWORD,
  })
    .then(response => {
      token = response.token;
      logger.info("Login succeeded", { token });
    })
    .catch(error => {
      logger.error("Login failed", { error });
    });

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
        channels: rxsInConsole.map(rx => rx.c_name),
        clipboardHistory: consoleClipboardHistories[consoleLocation],
      });
    });
  });
}

export async function getChannel(compName, token) {
  const { channels } = await getChannels({
    device_type: "tx",
    filter_c_description: compName,
    token,
  });

  if (!channels) {
    logger.error("No channel for computer specified", { compName });
    return null;
  }

  return channels.channel.c_name;
}

async function getReceiversInConsole(channel, token) {
  const { devices: rxs } = await getDevices({ token });
  const rx = rxs.device.find(rx => rx.c_name === channel);
  return rxs.device.filter(r => r.d_location === rx.d_location);
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

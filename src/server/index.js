import express from "express";
import http from "http";
import socketIO from "socket.io";
import path from "path";
import "dotenv/config";
import logger from "./logger.js";
import { login, getDevices, getChannels } from "./request";

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { wsEngine: "ws" });

app.use(express.static(path.join(__dirname, "../../build")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

app.get("/api/channel", async (req, res) => {
  const channel = await getChannel(req.query.comp, token);
  res.json({ channel });
});

const clipboardSpace = io.of("clipboard");

let token = null;

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

const consoleClipboardHistories = {};

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

async function getChannel(compName, token) {
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

async function getReceivers(token) {
  const { devices: rxs } = await getDevices({ token });
  return rxs;
}

async function getReceiversInConsole(channel, token) {
  const rxs = await getReceivers(token);
  const rx = rxs.device.find(rx => rx.c_name === channel);
  return rxs.device.filter(r => r.d_location === rx.d_location);
}

clipboardSpace.on("connection", async socket => {
  logger.info("Websocket connection", {
    channel: decodeURIComponent(socket.handshake.query.channel),
    version: decodeURIComponent(socket.handshake.query.version),
  });

  const socketId = socket.id;
  const channel = decodeURIComponent(socket.handshake.query.channel);
  const rxsInConsole = await getReceiversInConsole(channel, token);
  const consoleLocation = rxsInConsole[0].d_location;

  socket.emit("clipboard", {
    channels: [channel],
    clipboardHistory: consoleClipboardHistories[consoleLocation] || [],
  });

  socket.on("clipboard", async ({ clipboard }) => {
    logger.info("Copy", { channel, clipboard });
    const rxsInConsole = await getReceiversInConsole(channel, token);
    const consoleLocation = rxsInConsole[0].d_location;

    consoleClipboardHistories[consoleLocation] = addToConsoleClipboardHistory(
      clipboard,
      consoleClipboardHistories[consoleLocation]
    );

    clipboardSpace.emit("clipboard", {
      originator: channel,
      channels: rxsInConsole.map(rx => rx.c_name),
      clipboardHistory: consoleClipboardHistories[consoleLocation],
    });
  });
});

server.listen(process.env.PORT || 8080);

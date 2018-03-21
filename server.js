import express from "express";
import http from "http";
import socketIO from "socket.io";
import path from "path";
import { login, getDevices } from "./request";

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { wsEngine: "ws" });

app.use(express.static(path.join(__dirname, "build")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const clipboardSpace = io.of("clipboard");

let token = null;

try {
  login({ username: "admin", password: "password" }).then(response => {
    token = response.token;
  });
} catch (e) {
  console.log("error", e);
}

const consoleClipboardHistories = {};

function addToConsoleClipboardHistory(clipboardData, consoleClipboardHistory) {
  let newConsoleClipboardHistory = consoleClipboardHistory
    ? [...consoleClipboardHistory]
    : [];

  const existing = newConsoleClipboardHistory.findIndex(
    x =>
      clipboardData.type === x.type && clipboardData.clipboard === x.clipboard
  );

  if (existing !== -1) {
    newConsoleClipboardHistory = [
      clipboardData,
      ...newConsoleClipboardHistory.slice(0, existing),
      ...newConsoleClipboardHistory.slice(existing + 1),
    ];
  } else {
    newConsoleClipboardHistory.unshift(clipboardData);

    if (newConsoleClipboardHistory.length > 5) {
      newConsoleClipboardHistory = newConsoleClipboardHistory.slice(0, 6);
    }
  }

  return newConsoleClipboardHistory;
}

async function getReceivers(token) {
  const { devices: rxs } = await getDevices({ token });
  return rxs;
}

async function getReceiversInConsole(channelName, token) {
  const rxs = await getReceivers(token);
  const rx = rxs.device.find(rx => rx.c_name === channelName);
  return rxs.device.filter(r => r.d_location === rx.d_location);
}

clipboardSpace.on("connection", async socket => {
  const socketId = socket.id;
  const channelName = decodeURIComponent(socket.handshake.query.channelName);
  const rxsInConsole = await getReceiversInConsole(channelName, token);
  const consoleLocation = rxsInConsole[0].d_location;

  socket.emit("clipboard", {
    channelNames: [channelName],
    clipboardHistory: consoleClipboardHistories[consoleLocation] || [],
  });

  socket.on("copy-text", async ({ clipboard }) => {
    const rxsInConsole = await getReceiversInConsole(channelName, token);
    const consoleLocation = rxsInConsole[0].d_location;

    consoleClipboardHistories[consoleLocation] = addToConsoleClipboardHistory(
      { type: "text", clipboard },
      consoleClipboardHistories[consoleLocation]
    );

    clipboardSpace.emit("clipboard", {
      channelNames: rxsInConsole.map(rx => rx.c_name),
      clipboardHistory: consoleClipboardHistories[consoleLocation],
    });
  });

  socket.on("copy-image", async ({ clipboard }) => {
    const rxsInConsole = await getReceiversInConsole(channelName, token);
    const consoleLocation = rxsInConsole[0].d_location;

    consoleClipboardHistories[consoleLocation] = addToConsoleClipboardHistory(
      { type: "image", clipboard },
      consoleClipboardHistories[consoleLocation]
    );

    clipboardSpace.emit("clipboard", {
      channelNames: rxsInConsole.map(rx => rx.c_name),
      clipboardHistory: consoleClipboardHistories[consoleLocation],
    });
  });
});

server.listen(process.env.PORT || 8080);

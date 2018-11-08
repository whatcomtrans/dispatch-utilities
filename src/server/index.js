import express from "express";
import http from "http";
import path from "path";
import "dotenv/config";
import {
  setupClipboard,
  getChannelWithRetry,
  getDeviceLocationWithRetry,
} from "./clipboard";
import { setupMoig, makeCall } from "./moig";

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../../build")));
app.use(express.json());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

app.get("/api/channel", async (req, res) => {
  const channel = await getChannelWithRetry(req.query.comp);
  const location = await getDeviceLocationWithRetry(channel);
  res.json({ channel, location });
});

app.post("/api/call", async (req, res) => {
  const { number, dn } = req.body;
  const response = await makeCall(number, dn);
  if (response.error) {
    res.status(500).end();
  }
  res.status(204).end();
});

setupClipboard(server);
setupMoig();

server.listen(process.env.PORT || 8080);

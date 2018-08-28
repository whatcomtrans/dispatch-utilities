import express from "express";
import http from "http";
import path from "path";
import "dotenv/config";
import { setupClipboard, getChannel, token } from "./clipboard";

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../../build")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

app.get("/api/channel", async (req, res) => {
  const channel = await getChannel(req.query.comp, token);
  res.json({ channel });
});

setupClipboard(server);

server.listen(process.env.PORT || 8080);

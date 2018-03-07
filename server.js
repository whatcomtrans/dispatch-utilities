/*
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "build")));

app.get("/ping", function(req, res) {
  console.log('pinging');
  return res.send("pong");
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 8080);
*/

import express from "express";
import http from "http";
import socketIO from "socket.io";
//const bodyParser = require("body-parser");
import path from "path";

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "build")));

app.get("/ping", function(req, res) {
  console.log("pinging");
  return res.send("pong");
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

io.on("connection", socket => {
  console.log(`connection from ${socket.id}`);
  socket.on("clipboard", ({ id, clipboard }) => {
    const date = new Date().getSeconds();
    const client = io.clients((error, clients) => {
      if (id === clients[0]) {
        console.log(`server got "${clipboard}" from ${id}`);
        io.emit("clipboard", { id, clipboard });
      }
    });
  });
});

server.listen(process.env.PORT || 8080);

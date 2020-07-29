const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const socket = require("./socket");
const config = require("./config");

const app = express();

const staticUrl = path.join(__dirname, "..", "ui", "dist");
console.log("Serving static files at", staticUrl);
app.use(express.static(staticUrl));

app.use(
  express.urlencoded({
    extended: true,
  })
);

const wsServer = new WebSocket.Server({
  server: app.listen(config.port, config.host, () =>
    console.log(`Server listening at http://${config.host}:${config.port}`)
  ),
  path: "/play/",
});

wsServer.on("connection", socket.onConnection);

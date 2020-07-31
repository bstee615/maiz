const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const socket = require("./socket");
const config = require("./config");

const app = express();

const logging = require("./log");
const log = logging.getLogger(module.filename);

const staticUrl = path.join(__dirname, "..", "ui", "dist");
log.info("Serving static files at", staticUrl);
app.use(express.static(staticUrl));

app.use(
  express.urlencoded({
    extended: true,
  })
);

const ws = new WebSocket.Server({
  server: app.listen(config.port, config.host, () =>
    log.info(`Server listening at http://${config.host}:${config.port}`)
  ),
  path: "/play/",
});

ws.on("connection", socket.onConnection);

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const port = 3000;

const app = express();

players = {};

app.use(bodyParser.json());

app.get("/", (_, res) => res.sendFile(path.join(__dirname + "/index.html")));

app.post("/register", (req, res) => {
  const username = req.body.username;
  players[username] = {
    x: 0,
    y: 0,
  };
  console.log(`Registered ${username}`);
  res.send(`Registered ${username}`);
});

app.get("/update/:username", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(players));
});

app.post("/move", (req, res) => {
  const delta = req.body.delta;
  const username = req.body.username;
  players[username].x += delta.x;
  players[username].y += delta.y;
  console.log(`Moving ${username}`, delta);
});

const wsServer = new WebSocket.Server({
  server: app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
  ),
});

wsServer.on("connection", (socket) => {
  socket.on("message", (message) => {
    wsServer.clients.forEach((client) => {
      client.send(message);
    });
  });
});

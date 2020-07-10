const express = require("express");
const WebSocket = require("ws");
const uuid = require("uuid");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(express.static("ui"));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/play", (req, res) => {
  res.cookie("username", req.query.username);
  res.redirect("/game.html");
});

const wsServer = new WebSocket.Server({
  server: app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`)
  ),
  path: "/play",
});

let clients = {};
let positions = {};
wsServer.on("connection", (socket) => {
  socket.id = uuid.v4();
  clients[socket.id] = socket;
  console.log(`registered client`, socket.id);
  socket.on("message", (msgJson) => onMessage(msgJson, socket.id));
});

wsServer.on("close", (socket) => {
  const toDelete = clients[socket.id];
  console.log(toDelete.id, "disconnected");
  wsServer.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        type: "delete",
        username: toDelete.username,
      })
    );
  });
  delete clients[socket.id];
});

function onMessage(msgJson, id) {
  const client = clients[id];
  const msg = JSON.parse(msgJson);
  switch (msg.cmd) {
    case "initialize":
      client.username = msg.username;
      console.log("initialize", msg.username);

      positions[msg.username] = {
        x: 0,
        y: 0,
      };

      client.send(
        JSON.stringify({
          type: "initialize",
          positions,
        })
      );
      break;
    case "move":
      const username = client.username;

      console.log("moving", msg.delta);
      positions[username].x += msg.delta.x;
      positions[username].y += msg.delta.y;
      client.send(
        JSON.stringify({
          type: "update",
          username,
          position: positions[username],
        })
      );
      break;
    default:
      console.log("unhandled cmd", msg.cmd, msg);
  }
}

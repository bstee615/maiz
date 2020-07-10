const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const uuid = require("uuid");
const port = 3000;

const app = express();

app.use(bodyParser.json());

app.get("/", (_, res) => res.sendFile(path.join(__dirname + "/index.html")));

app.get("/play", (req, res) => {
  const username = req.params.username;
  res.cookie("username", username);
  res.sendFile(path.join(__dirname + "/play.html"));
});

const wsServer = new WebSocket.Server(
  {
    server: app.listen(port, () =>
      console.log(`Server listening at http://localhost:${port}`)
    ),
    path: "/play",
  },
  () => console.log(`WS listening at http://localhost:${port}/play`)
);

let clients = {};
let players = {};
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
    case "register":
      console.log("register", msg.username);
      client.username = msg.username;
      players[msg.username] = {
        x: 0,
        y: 0,
      };
      client.send(
        JSON.stringify({
          type: "initialize",
          players,
        })
      );
      break;
    case "move":
      const username = client.username;
      const delta = msg.delta;
      console.log("moving", delta);

      players[username].x += delta.x;
      players[username].y += delta.y;
      wsServer.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "update",
            username,
            pos: players[username],
          })
        );
      });
      break;
    default:
      console.log("unhandled cmd", cmd, msg);
  }
}

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const port = 3000;

const app = express();

app.use(bodyParser.json());

app.get("/", (_, res) => res.sendFile(path.join(__dirname + "/index.html")));

const wsServer = new WebSocket.Server({
  server: app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
  ),
});

let clients = {};
let players = {};
let id = 0;
wsServer.on("connection", (socket) => {
  const thisId = id;
  clients[thisId] = socket;
  console.log(`clients[${thisId}]`);
  socket.on("message", (msgJson) => onMessage(msgJson, thisId));
  id++;
  //   const res = {
  //     type: "id",
  //     id: thisId,
  //   };
  //   socket.send(JSON.stringify(res));
});

function onMessage(msgJson, id) {
  const client = clients[id];
  const msg = JSON.parse(msgJson);
  switch (msg.cmd) {
    case "register":
      console.log("register", msg.username);
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
      const username = msg.username;
      const delta = msg.delta;
      console.log("moving", username, delta);

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

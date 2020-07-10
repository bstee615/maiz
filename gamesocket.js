const uuid = require("uuid");
const WebSocket = require("ws");

const config = require("./config");

exports.listen = function (app) {
  const wsServer = new WebSocket.Server({
    server: app.listen(config.port, () =>
      console.log(`Server listening at http://localhost:${config.port}`)
    ),
    path: "/play",
  });

  wsServer.on("connection", onConnection);
};

let clients = {};
let positions = {};

function onConnection(socket) {
  socket.id = uuid.v4();
  console.log(`registered client`, socket.id);
  clients[socket.id] = socket;
  socket.on("message", (msgJson) => onMessage(msgJson, socket.id));
}

function onMessage(msgJson, id) {
  const client = clients[id];
  const msg = JSON.parse(msgJson);
  doCommand(client, msg);
}

function doCommand(client, cmd) {
  switch (cmd.cmd) {
    case "initialize":
      client.username = cmd.username;
      console.log("initialize", cmd.username);

      positions[cmd.username] = {
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

      console.log("moving", cmd.delta);
      positions[username].x += cmd.delta.x;
      positions[username].y += cmd.delta.y;
      client.send(
        JSON.stringify({
          type: "update",
          username,
          position: positions[username],
        })
      );
      break;
    default:
      console.log("unhandled cmd", cmd.cmd, cmd);
  }
}

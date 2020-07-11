const uuid = require("uuid");
const WebSocket = require("ws");

const config = require("./config");
const state = require("./state");

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

function onConnection(socket) {
  socket.id = uuid.v4();
  console.log(`registered client`, socket.id);
  clients[socket.id] = socket;
  socket.on("message", (msgJson) => onMessage(msgJson, socket.id));
}

class NetCtx {
  constructor(client) {
    this.client = client;
    this.username = client.username;
  }

  broadcast(msg) {
    for (const id in clients) {
      clients[id].send(msg);
    }
  }

  send(msg) {
    this.client.send(msg);
  }

  setUsername(username) {
    this.username = username;
    this.client.username = username;
  }
}

function onMessage(msgJson, id) {
  const client = clients[id];
  const cmd = JSON.parse(msgJson);
  const netCtx = new NetCtx(client);
  state.doCmd(cmd, netCtx);
}
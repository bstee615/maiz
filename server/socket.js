const uuid = require("uuid");

const state = require("./state");

let clients = {};

exports.onConnection = function (socket) {
  socket.id = uuid.v4();
  console.log(`registered client`, socket.id);
  clients[socket.id] = socket;
  socket.on("message", (msgJson) => onMessage(msgJson, socket.id));
};

class NetCtx {
  constructor(client) {
    this.client = client;
  }

  broadcast(msg) {
    for (const id in clients) {
      clients[id].send(msg);
    }
  }

  send(msg) {
    this.client.send(msg);
  }

  get username() {
    return this.client.username;
  }

  setUsername(username) {
    this.client.username = username;
  }
}

function onMessage(msgJson, id) {
  const client = clients[id];
  const cmd = JSON.parse(msgJson);
  const netCtx = new NetCtx(client);
  state.doCmd(cmd, netCtx);
}

const uuid = require("uuid");

const state = require("./state");

const logging = require("./log");

const log = logging.getLogger(module.filename);

let clients = {};
exports.clients = clients;

class NetContext {
  constructor(client) {
    this.client = client;
    this.log = logging.getLogger(this.constructor.name);

    this.log.debug("constructor", { username: this.username });
  }

  broadcast(msg) {
    this.log.debug("broadcast", { msg, clients: Object.keys(clients) });

    for (const id in clients) {
      clients[id].send(msg);
    }
  }

  send(msg) {
    this.log.debug("send", { msg, username: this.username });

    this.client.send(msg);
  }

  get username() {
    return this.client.username;
  }

  setUsername(username) {
    this.log.debug("setUsername", { username: this.username, username });

    this.client.username = username;
  }
}

function registerClient(socket) {
  socket.id = uuid.v4();
  clients[socket.id] = socket;
  socket.on("message", (msgJson) => onMessage(msgJson, socket.id));

  log.info(`registered client`, socket.id);
}

exports.onConnection = function (socket) {
  registerClient(socket);
};

function onMessage(msgJson, id) {
  const client = clients[id];
  const cmd = JSON.parse(msgJson);
  const netCtx = new NetContext(client);
  state.doCmd(cmd, netCtx);
}

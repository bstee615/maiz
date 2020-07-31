const uuid = require("uuid");

const state = require("./state");

const logging = require("./log");

const log = logging.getLogger(module.filename);

let clients = {};

function registerClient(socket) {
  socket.id = uuid.v4();
  clients[socket.id] = socket;
  socket.on("message", (msgJson) => onMessage(msgJson, socket.id));

  log.info(`registered client`, socket.id);
}

exports.onConnection = function (socket) {
  try {
    registerClient(socket);
  } catch (ex) {
    log.error("onConnection exception", { ex });
  }
};

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
}

function doCommand(command, client) {
  const ctx = new NetContext(client);

  log.debug("doCommand", { command, username: client.username });

  switch (command.code) {
    case "initialize":
      client.username = command.username;
      state.initializePlayer(ctx, client.username);
      break;
    case "move":
      state.movePlayer(ctx, client.username, command.delta);
      break;
    case "reset":
      state.resetMap(ctx);
      break;
    default:
      log.warn("unhandled command", command);
      break;
  }
}

function onMessage(message, id) {
  try {
    const command = JSON.parse(message);
    const client = clients[id];
    doCommand(command, client);
  } catch (ex) {
    log.error("onMessage exception", { ex, message, id });
  }
}

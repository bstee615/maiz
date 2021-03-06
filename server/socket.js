const uuid = require("uuid");

const { getLogger } = require("./log");
const log = getLogger(module.filename);

const { State } = require("./State");
const state = new State();

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

    this.log = getLogger(this.constructor.name);
    this.log.debug("constructor", { username: this.username });
  }

  broadcast(msg) {
    this.log.debug("broadcast", { msg, clients: Object.keys(clients) });

    for (const id in clients) {
      clients[id].send(msg);
    }
  }

  send(msg) {
    this.log.debug("send", { msg, username: this.client.username });

    this.client.send(msg);
  }

  handleReply(replies) {
    for (const reply of replies) {
      const message = JSON.stringify(reply.data);
      switch (reply.type) {
        case "send":
          this.send(message);
          break;
        case "broadcast":
          this.broadcast(message);
          break;
      }
    }
  }
}

function doCommand(command, client) {
  const ctx = new NetContext(client);

  log.debug("doCommand", {
    command,
    username: client.username || command.username,
  });

  let promise;

  switch (command.code) {
    case "initialize":
      if (client.username) {
        throw new Error(
          `Cannot reinitialize username to "${command.username}" for client "${client.username}".`
        );
      }
      client.username = command.username;
      promise = state.initializePlayer(command.username);
      break;
    case "move":
      promise = state.movePlayer(client.username, command.delta);
      break;
    case "reset":
      promise = state.resetMap();
      break;
    default:
      promise = Promise.reject(new Error(`unhandled command ${command}`));
      break;
  }

  promise
    .then((reply) => {
      ctx.handleReply(reply);
    })
    .catch((ex) => log.error("doCommand error", { ex }));
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

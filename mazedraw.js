// Interacts with the mazedraw service

const net = require("net");
const config = require("./config");

let client = net.Socket();

exports.draw = function (width, height, maze, cb) {
  client.connect(config.maze.port, "localhost");
  client.write(JSON.stringify({ width, height, maze }));

  client.on("data", function (data) {
    cb(data);
  });

  client.end();
};

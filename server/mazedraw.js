// Interacts with the mazedraw service

const net = require("net");
const config = require("./config");

exports.draw = function (width, height, maze, cb) {
  const { walls, startingPoint, ends } = maze;

  let client = net.Socket();
  client.connect(config.maze.port, "localhost");
  client.write(JSON.stringify({ width, height, walls, startingPoint, ends }));

  client.on("data", function (data) {
    cb(data);
    client.destroy();
  });

  client.end();
};

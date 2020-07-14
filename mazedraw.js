// Interacts with the mazedraw service

const net = require("net");
const config = require("./config");

let client = net.Socket();

exports.draw = function (width, height, walls, startingPoint, cb) {
  client.connect(config.maze.port, "localhost");
  client.write(JSON.stringify({ width, height, walls, startingPoint }));

  client.on("data", function (data) {
    cb(data);
  });

  client.end();
};

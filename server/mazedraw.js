// Interacts with the mazedraw service

const net = require("net");
const config = require("./config");

exports.draw = function (width, height, maze, cb) {
  const { walls, startingPoint, ends } = maze;

  try {
    let client = net.Socket();
    client.connect(config.maze.port, config.mazedraw.host);
    console.log(
      `Sending maze request to ${config.mazedraw.host}:${config.maze.port}`
    );
    client.write(JSON.stringify({ width, height, walls, startingPoint, ends }));

    client.on("data", function (data) {
      cb(data);
      client.destroy();
    });
    client.on("error", function (ex) {
      console.error("Could not connect with mazedraw service", ex);
      cb(null);
      client.destroy();
    });

    client.end();
  } catch (e) {
    console.error(
      "Encountered exception when connecting with mazedraw service",
      ex
    );
  } finally {
  }
};

const net = require("net");
const config = require("./config");

let client = net.Socket();

exports.send = function (width, height, maze) {
  client.connect(config.maze.port, "localhost");
  client.write(JSON.stringify({ width, height, maze }));

  client.on("data", function (d) {
    console.log(d.toString());
  });

  client.end();
};

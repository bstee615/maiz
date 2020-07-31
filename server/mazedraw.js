// Interacts with the mazedraw service

const net = require("net");
const config = require("./config");

const log = require("./log").getLogger(module.filename);

exports.draw = function (width, height, maze, cellSize) {
  const { walls, startingPoint, ends } = maze;

  return new Promise((resolve, reject) => {
    try {
      let client = net.Socket();
      const host = config.mazedraw.host,
        port = config.mazedraw.port;
      client.connect(port, host);
      log.info(`Sending maze request to ${host}:${port}`);

      const timeoutMs = 1000 * 60; // 1 minute

      let terminated = false;
      // Set terminated if it's unset, and return the old value.
      function setFlagAndGetOld() {
        if (!terminated) {
          terminated = true;
          return false;
        } else {
          return true;
        }
      }

      client.on("data", function (data) {
        if (setFlagAndGetOld()) return;

        resolve(data);
        client.destroy();
      });
      client.on("error", function (ex) {
        if (setFlagAndGetOld()) return;

        reject(ex);
        client.destroy();
      });
      setTimeout(function () {
        if (setFlagAndGetOld()) return;

        reject(new Error(`mazedraw service timed out at ${timeoutMs}ms`));
      }, timeoutMs);

      client.write(
        JSON.stringify({ width, height, walls, startingPoint, ends, cellSize })
      );
      client.end();
    } catch (ex) {
      log.error("draw exception ", { ex });
    }
  });
};

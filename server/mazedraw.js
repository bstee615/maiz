// Interacts with the mazedraw service

const config = require("./config");
const axios = require("axios");

const { getLogger } = require("./log");
const log = getLogger(module.filename);

exports.draw = function (width, height, maze, cellSize) {
  const { walls, startingPoint, ends } = maze;
  const { host, port } = config.mazedraw;
  const address = `http://${host}:${port}`;

  log.info(`Sending maze request to ${address}`);
  const options = {
    url: address,
    method: "post",
    data: {
      width,
      height,
      walls,
      startingPoint,
      ends,
      cellSize,
    },
  };
  return axios(options).then((response) => {
    log.debug("got response", response.data);
    return response.data;
  });
};

const canvas = require("./canvas");

let players = {};

exports.update = function (data, username) {
  console.log("data", data);
  switch (data.code) {
    case "initialize":
      players = data.positions;
      const map = data.map;
      canvas.setPositions(players);
      canvas.initialize(data.w, data.h);
      canvas
        .setMap(map)
        .then(() => canvas.redraw())
        .catch((err) => console.error("error setting map", err));
      break;
    case "join":
      if (username === data.username) {
        break;
      }
      console.log("join", data.username, data.position);
      players[data.username] = data.position;
      canvas.redraw();
      break;
    case "update":
      console.log("update", data.username, data.position);
      players[data.username] = data.position;
      canvas.setPositions(players);
      canvas.redraw();
      break;
    default:
      console.log("unhandled code", data.code, data);
      break;
  }
};

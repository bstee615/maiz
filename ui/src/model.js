const canvas = require("./canvas");

let players = {};

exports.update = function (data) {
  console.log("data", data);
  switch (data.code) {
    case "initialize":
      players = data.positions;
      canvas.redraw(players);
      break;
    case "update":
      console.log("update", data.username, data.position);
      players[data.username] = data.position;
      canvas.redraw(players);
      break;
    default:
      console.log("unhandled cmd", cmd.cmd, cmd);
      break;
  }
};

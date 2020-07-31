const canvas = require("./canvas");

let players = {};

exports.update = function (data, username) {
  console.log("data", data);
  switch (data.code) {
    case "initialize":
      players = data.players;
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
      console.log("join", data.username, data.player);
      players[data.username] = data.player;
      canvas.redraw();
      break;
    case "update":
      console.log("update", data.username, data.player);
      Object.assign(players[data.username], data.player);
      canvas.redraw();
      break;
    case "win":
      // canvas.remove();
      const won = document.createElement("div");
      won.textContent = `${data.username} won!`;
      document.body.appendChild(won);
      break;
    default:
      console.log("unhandled code", data.code, data);
      break;
  }
};

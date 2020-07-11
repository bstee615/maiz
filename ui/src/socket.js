const model = require("./model");

var socket;

exports.sendMove = function (x, y) {
  let delta = {
    x,
    y,
  };

  socket.send(
    JSON.stringify({
      code: "move",
      delta,
    })
  );
};

exports.connect = function (username) {
  socket = new WebSocket("ws://localhost:3000/play");

  socket.addEventListener("open", () => {
    socket.send(
      JSON.stringify({
        code: "initialize",
        username,
      })
    );
  });
  socket.addEventListener("message", onMessage);
};

function onMessage(msg) {
  console.log("message", msg);
  const data = JSON.parse(msg.data);
  model.update(data);
}
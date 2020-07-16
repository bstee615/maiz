const model = require("./model");

var socket;

const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
  socket.send(
    JSON.stringify({
      code: "reset",
    })
  );
});

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
  socket = new WebSocket("ws://" + location.host + "/play/");

  socket.addEventListener("open", () => {
    socket.send(
      JSON.stringify({
        code: "initialize",
        username,
      })
    );
    resetButton.disabled = false;
  });
  socket.addEventListener("message", (msg) => onMessage(msg, username));
};

function onMessage(msg, username) {
  console.log("message", msg);
  const data = JSON.parse(msg.data);
  model.update(data, username);
}

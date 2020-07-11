const socket = require("./socket");

var canvas;
var context;

let keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

exports.initialize = function (w, h) {
  canvas = document.createElement("canvas");
  context = canvas.getContext("2d");

  canvas.width = "400";
  canvas.height = "400";
  canvas.style = "border: 1px solid black;";

  document.body.appendChild(canvas);

  let focused;

  document.addEventListener(
    "mousedown",
    function (event) {
      focused = event.target == canvas;
    },
    false
  );

  document.addEventListener("keydown", (ev) => {
    if (focused) {
      if (ev.key in keys && keys[ev.key] === false) {
        keys[ev.key] = true;
        switch (ev.key) {
          case "ArrowLeft":
            socket.sendMove(-1, 0);
            break;
          case "ArrowRight":
            socket.sendMove(1, 0);
            break;
          case "ArrowUp":
            socket.sendMove(0, -1);
            break;
          case "ArrowDown":
            socket.sendMove(0, 1);
            break;
        }
      }
    }
  });

  document.addEventListener("keyup", (ev) => {
    if (focused) {
      if (ev.key in keys) {
        keys[ev.key] = false;
      }
    }
  });
};

exports.redraw = function (posByUsername) {
  console.log(`Update positions`, posByUsername);
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const username in posByUsername) {
    const pos = posByUsername[username];
    const squareSize = canvas.width / 40;
    context.beginPath();
    context.rect(
      pos.x * squareSize,
      pos.y * squareSize,
      squareSize,
      squareSize
    );
    context.stroke();
  }
};

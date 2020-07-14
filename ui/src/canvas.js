const socket = require("./socket");

var canvas;
var context;

let keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

const width = 400,
  height = 400;
const numCells = 10;
const squareSize = width / numCells;

exports.initialize = function () {
  canvas = document.createElement("canvas");
  context = canvas.getContext("2d");

  canvas.width = width.toString();
  canvas.height = height.toString();
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

let mapImage;

exports.setMap = function (imageBase64) {
  // https://web.dev/promises/
  return new Promise(function (resolve, reject) {
    let img = new Image();
    img.onload = function () {
      mapImage = img;
      resolve();
    };
    img.onerror = reject;
    img.src = "data:image/png;base64," + imageBase64;
  });
};

let positionsByPlayer = {};

exports.setPositions = function (positions) {
  console.log(`Update positions`, positions);
  positionsByPlayer = positions;
};

exports.redraw = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

  for (const username in positionsByPlayer) {
    const pos = positionsByPlayer[username];
    context.fillStyle = "#FF0000";

    context.beginPath();
    context.arc(
      pos.x * squareSize + squareSize / 2,
      pos.y * squareSize + squareSize / 2,
      squareSize / 2,
      squareSize / 2,
      2 * Math.PI
    );
    context.fill();
  }
};

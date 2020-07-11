function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}
const username = getCookie("username");

var socket = new WebSocket("ws://localhost:3000/play");

socket.addEventListener("open", () => {
  const cmd = {
    code: "initialize",
    username,
  };

  socket.send(JSON.stringify(cmd));
});
socket.addEventListener("message", onMessage);

const canvas = document.getElementById("maze");
var context = canvas.getContext("2d");
let players = {};
let keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

canvas.addEventListener("keydown", (ev) => {
  if (ev.key in keys && keys[ev.key] === false) {
    keys[ev.key] = true;
    switch (ev.key) {
      case "ArrowLeft":
        move(-1, 0);
        break;
      case "ArrowRight":
        move(1, 0);
        break;
      case "ArrowUp":
        move(0, -1);
        break;
      case "ArrowDown":
        move(0, 1);
        break;
    }
  }
});

canvas.addEventListener("keyup", (ev) => {
  if (ev.key in keys) {
    keys[ev.key] = false;
  }
});

function move(x, y) {
  let delta = {
    x,
    y,
  };

  const cmd = {
    code: "move",
    delta,
  };
  socket.send(JSON.stringify(cmd));
}

function onMessage(msg) {
  console.log("message", msg);
  const data = JSON.parse(msg.data);
  console.log("data", data);
  switch (data.code) {
    case "initialize":
      players = data.positions;
      redrawCanvas(players);
      break;
    case "update":
      console.log("update", data.username, data.position);
      players[data.username] = data.position;
      redrawCanvas(players);
      break;
    default:
      console.log("unhandled cmd", cmd.cmd, cmd);
      break;
  }
}

function redrawCanvas(posByUsername) {
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
}

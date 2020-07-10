function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}
const username = getCookie("username");

var socket = new WebSocket("ws://localhost:3000/play");

socket.addEventListener("open", () => {
  const cmd = {
    cmd: "register",
    username,
  };

  socket.send(JSON.stringify(cmd));
});
socket.addEventListener("message", onMessage);

const canvas = document.getElementById("maze");
var context = canvas.getContext("2d");
let players = {};
let keys = {
  ArrowLeft: 0,
  ArrowRight: 0,
  ArrowUp: 0,
  ArrowDown: 0,
};

canvas.addEventListener("keydown", function (ev) {
  if (ev.key in keys) {
    keys[ev.key] = 1;
  }
});

canvas.addEventListener("keyup", function (ev) {
  if (ev.key in keys) {
    keys[ev.key] = 0;
  }
});

function sendMove() {
  let delta = {
    x: 0,
    y: 0,
  };

  delta.x -= keys.ArrowLeft;
  delta.x += keys.ArrowRight;
  delta.y -= keys.ArrowUp;
  delta.y += keys.ArrowDown;

  if (delta.x === 0 && delta.y === 0) {
    return;
  }

  const cmd = {
    cmd: "move",
    delta,
  };
  socket.send(JSON.stringify(cmd));
}

function onMessage(msg) {
  console.log("message", msg);
  const data = JSON.parse(msg.data);
  console.log("data", data);
  switch (data.type) {
    case "initialize":
      players = data.players;
      setInterval(sendMove, 10);
      break;
    case "update":
      console.log("update", data.username, data.pos);
      players[data.username] = data.pos;
      break;
  }

  redrawCanvas(players);
}

function redrawCanvas(posByUsername) {
  console.log(`Update positions`, posByUsername);
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var username in posByUsername) {
    const pos = posByUsername[username];
    context.beginPath();
    context.rect(pos.x, pos.y, 10, 10);
    context.stroke();
  }
}

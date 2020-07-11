const canvas = require("./canvas");
const socket = require("./socket");

canvas.initialize(400, 400);

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}
const username = getCookie("username");

socket.connect(username);

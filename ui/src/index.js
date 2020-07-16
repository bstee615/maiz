const socket = require("./socket");

const usernameInput = document.getElementById("username");
const username = () => usernameInput.value;

const loginButton = document.getElementById("login");
loginButton.addEventListener("click", () => {
  usernameInput.remove();
  loginButton.remove();
  socket.connect(username());
});

const socket = require("./socket");

const usernameInput = document.createElement("input");
usernameInput.type = "text";
usernameInput.placeholder = "username";
document.body.appendChild(usernameInput);

const username = () => usernameInput.value;

const loginButton = document.createElement("button");
loginButton.textContent = "Login";
loginButton.addEventListener("click", () => {
  usernameInput.remove();
  loginButton.remove();
  socket.connect(username());
});
document.body.appendChild(loginButton);

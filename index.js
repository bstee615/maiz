const express = require("express");
const app = express();
var path = require("path");
var bodyParser = require("body-parser");
const port = 3000;

players = {};

app.use(bodyParser.json());

app.get("/", (_, res) => res.sendFile(path.join(__dirname + "/index.html")));

app.post("/register", (req, res) => {
  const username = req.body.username;
  players[username] = {
    x: 0,
    y: 0,
  };
  console.log(`Registered ${username}`);
  res.send(`Registered ${username}`);
});

app.get("/update/:username", (req, res) => {
  const username = req.params.username;
  console.log(`Update ${username}`);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(players[username]));
  console.log(`Replying with ${players[username]}`);
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

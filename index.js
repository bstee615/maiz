const express = require("express");

const app = express();
const gamesocket = require("./gamesocket");

app.use(express.static("ui/dist"));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/play", (req, res) => {
  res.cookie("username", req.query.username);
  res.redirect("/game.html");
});

gamesocket.listen(app);

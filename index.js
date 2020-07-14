const express = require("express");

const app = express();
const gamesocket = require("./gamesocket");

app.use(express.static("ui/dist"));

app.use(
  express.urlencoded({
    extended: true,
  })
);

gamesocket.listen(app);

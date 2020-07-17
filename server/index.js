const express = require("express");

const app = express();
const gamesocket = require("./gamesocket");
const path = require("path");

const staticUrl = path.join(__dirname, "..", "ui", "dist");

console.log("Serving static files at", staticUrl);
app.use(express.static(staticUrl));

app.use(
  express.urlencoded({
    extended: true,
  })
);

gamesocket.listen(app);

exports.port = 8000;
exports.host = "127.0.0.1";
exports.mazedraw = {
  host: "localhost",
};

const fs = require("fs");
const path = require("path");
exports.maze = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "mazeconfig.json"))
);

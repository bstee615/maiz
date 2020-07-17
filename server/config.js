exports.port = process.env.NODE_ENV === "production" ? 80 : 3000;
exports.host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
exports.mazedraw = {
  host: process.env.MAZEDRAW_URL || "localhost",
};

const fs = require("fs");
const path = require("path");
exports.maze = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "mazeconfig.json"))
);

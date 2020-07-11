exports.port = 3000;

const fs = require("fs");
exports.maze = JSON.parse(fs.readFileSync("mazeconfig.json"));

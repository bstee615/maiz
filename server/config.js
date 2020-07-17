exports.port = process.env.NODE_ENV === "production" ? 80 : 3000;
exports.host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

const fs = require("fs");
exports.maze = JSON.parse(fs.readFileSync(__dirname + "\\..\\mazeconfig.json"));

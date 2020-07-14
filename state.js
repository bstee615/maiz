const mazedraw = require("./mazedraw");
const backtrack = require("./backtrack");

let positions = {};
let maze;
let start;
const w = 30,
  h = 30;

function inBounds(pos) {
  return pos.x >= 0 && pos.x < w && pos.y >= 0 && pos.y < h;
}

function wallBlocks(oldPos, newPos) {
  for (const other of maze[oldPos.y][oldPos.x]) {
    if (other.col === newPos.x && other.row === newPos.y) {
      return true;
    }
  }
}

function validMove(oldPos, newPos) {
  if (!inBounds(newPos)) {
    return false;
  }

  if (wallBlocks(oldPos, newPos)) {
    return false;
  }

  return true;
}

exports.doCmd = function (cmd, ctx) {
  switch (cmd.code) {
    case "initialize":
      ctx.setUsername(cmd.username);
      console.log("initialize", cmd.username);

      if (!maze) {
        const mazeInfo = backtrack.gen(w, h);
        maze = mazeInfo.walls;
        start = mazeInfo.startingPoint;
      }

      positions[cmd.username] = {
        x: start.col,
        y: start.row,
      };

      mazedraw.draw(w, h, maze, start, (mazeMap) =>
        ctx.send(
          JSON.stringify({
            code: "initialize",
            positions,
            map: mazeMap.toString("base64"),
          })
        )
      );
      break;
    case "move":
      const oldPosition = positions[ctx.username];
      const newPosition = {
        x: oldPosition.x + cmd.delta.x,
        y: oldPosition.y + cmd.delta.y,
      };

      console.log("moving", cmd.delta, "from", oldPosition, "to", newPosition);

      if (validMove(oldPosition, newPosition)) {
        positions[ctx.username] = newPosition;
      }

      ctx.broadcast(
        JSON.stringify({
          code: "update",
          username: ctx.username,
          position: positions[ctx.username],
        })
      );
      break;
    default:
      console.log("unhandled code", cmd);
      break;
  }
};

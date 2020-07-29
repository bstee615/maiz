const mazedraw = require("./micro/mazedraw");
const backtrack = require("./mazegen/backtrack");
const randomColor = require("randomcolor");

let positions = {};
let maze = null;
const w = 10,
  h = 10,
  cellSize = 10;

function inBounds(pos) {
  return pos.x >= 0 && pos.x < w && pos.y >= 0 && pos.y < h;
}

function wallBlocks(oldPos, newPos) {
  for (const other of maze.walls[oldPos.y][oldPos.x]) {
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

function wins(playerPos) {
  for (const pos of maze.ends) {
    if (pos.point.row == playerPos.y && pos.point.col == playerPos.x) {
      return true;
    }
  }
  return false;
}

exports.doCmd = function (cmd, ctx) {
  switch (cmd.code) {
    case "initialize":
      ctx.setUsername(cmd.username);
      console.log("initialize", cmd.username);

      if (!maze) {
        maze = backtrack.gen(w, h);
      }

      const color = randomColor();

      positions[cmd.username] = {
        x: maze.startingPoint.col,
        y: maze.startingPoint.row,
        color,
      };

      mazedraw.draw(w, h, maze, cellSize, (mazeMap) => {
        ctx.send(
          JSON.stringify({
            code: "initialize",
            positions,
            map: mazeMap.toString("base64"),
            w,
            h,
          })
        );
        ctx.broadcast(
          JSON.stringify({
            code: "join",
            username: ctx.username,
            position: positions[ctx.username],
          })
        );
      });
      break;
    case "move":
      const oldPosition = positions[ctx.username];
      const newPosition = {
        x: oldPosition.x + cmd.delta.x,
        y: oldPosition.y + cmd.delta.y,
      };

      console.log("moving", cmd.delta, "from", oldPosition, "to", newPosition);

      if (validMove(oldPosition, newPosition)) {
        Object.assign(positions[ctx.username], newPosition);

        if (wins(newPosition)) {
          ctx.broadcast(
            JSON.stringify({
              code: "win",
              username: ctx.username,
            })
          );
        }
      }

      ctx.broadcast(
        JSON.stringify({
          code: "update",
          username: ctx.username,
          position: positions[ctx.username],
        })
      );
      break;
    case "reset":
      console.log("resetting server");
      const tempMaze = backtrack.gen(w, h);
      mazedraw.draw(w, h, tempMaze, cellSize, (mazeMap) => {
        for (const uname in positions) {
          Object.assign(positions[uname], {
            x: maze.startingPoint.col,
            y: maze.startingPoint.row,
          });
        }
        maze = tempMaze;
        ctx.broadcast(
          JSON.stringify({
            code: "initialize",
            positions,
            map: mazeMap.toString("base64"),
            w,
            h,
          })
        );
      });
      break;
    default:
      console.log("unhandled code", cmd);
      break;
  }
};

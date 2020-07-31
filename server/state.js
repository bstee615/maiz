const mazedraw = require("./mazedraw");
const backtrack = require("./backtrack");
const randomColor = require("randomcolor");

const log = require("./log").getLogger(module.filename);

let players = {};
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

function setMaze(newMaze) {
  log.info("setMaze", { old: maze, new: newMaze });
  maze = newMaze;
}

function createPlayer(username, state) {
  log.info("createPosition", { username, state });

  if (players[username]) {
    log.error("player already exists", {
      username,
      old: players[username],
      new: state,
    });
    return;
  }

  players[username] = state;
}

function setPlayerPosition(username, position) {
  log.info("mergePosition", { username, position });

  if (!players[username]) {
    log.error("player does not exist", {
      username,
      position,
    });
    return;
  }

  Object.assign(players[username], position);
}

exports.doCmd = function (cmd, ctx) {
  log.debug("doCmd", { code: cmd.code, cmd, username: ctx.username });

  switch (cmd.code) {
    case "initialize":
      ctx.setUsername(cmd.username);

      if (!maze) {
        setMaze(backtrack.gen(w, h));
      }

      createPlayer(ctx.username, {
        x: maze.startingPoint.col,
        y: maze.startingPoint.row,
        color: randomColor(),
      });

      mazedraw.draw(w, h, maze, cellSize, (mazeMap) => {
        ctx.send(
          JSON.stringify({
            code: "initialize",
            players,
            map: mazeMap.toString("base64"),
            w,
            h,
          })
        );
        ctx.broadcast(
          JSON.stringify({
            code: "join",
            username: ctx.username,
            player: players[ctx.username],
          })
        );
      });
      break;
    case "move":
      const from = players[ctx.username];
      const to = {
        x: from.x + cmd.delta.x,
        y: from.y + cmd.delta.y,
      };

      log.debug("moving", { delta: cmd.delta, from, to });

      if (validMove(from, to)) {
        setPlayerPosition(ctx.username, to);

        if (wins(to)) {
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
          player: players[ctx.username],
        })
      );
      break;
    case "reset":
      const tempMaze = backtrack.gen(w, h);

      mazedraw.draw(w, h, tempMaze, cellSize, (mazeMap) => {
        log.info("resetting the map", w, h, cellSize);

        for (const uname in players) {
          setPlayerPosition(uname, {
            x: maze.startingPoint.col,
            y: maze.startingPoint.row,
          });
        }

        setMaze(tempMaze);

        ctx.broadcast(
          JSON.stringify({
            code: "initialize",
            players,
            map: mazeMap.toString("base64"),
            w,
            h,
          })
        );
      });
      break;
    default:
      log.warn("unhandled cmd", cmd);
      break;
  }
};

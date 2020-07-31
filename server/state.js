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
  log.info("createPlayer", { username, state });

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
  log.debug("setPlayerPosition begin", { username, position });

  if (!players[username]) {
    log.error("setPlayerPosition error", {
      reason: "player does not exist",
      username,
      position,
    });
    return;
  }

  Object.assign(players[username], position);

  log.debug("setPlayerPosition end");
}

function reply(type, data) {
  return {
    type,
    message: JSON.stringify(data),
  };
}

exports.initializePlayer = function (username) {
  log.info("initializePlayer", { username });

  if (!maze) {
    setMaze(backtrack.gen(w, h));
  }

  createPlayer(username, {
    x: maze.startingPoint.col,
    y: maze.startingPoint.row,
    color: randomColor(),
  });

  return mazedraw.draw(w, h, maze, cellSize).then((mazeMap) => {
    return [
      reply("send", {
        code: "initialize",
        players,
        map: mazeMap.toString("base64"),
        w,
        h,
      }),
      reply("broadcast", {
        code: "join",
        username: username,
        player: players[username],
      }),
    ];
  });
};

exports.movePlayer = function (username, delta) {
  log.debug("movePlayer", { username, delta });

  const from = players[username];
  const to = {
    x: from.x + delta.x,
    y: from.y + delta.y,
  };

  log.debug("calculated positions", { username, from, to });

  let replies = [];

  if (validMove(from, to)) {
    setPlayerPosition(username, to);

    if (wins(to)) {
      replies.push(
        reply("broadcast", {
          code: "win",
          username: username,
        })
      );
    }
  }

  replies.push(
    reply("broadcast", {
      code: "update",
      username: username,
      player: players[username],
    })
  );

  return Promise.resolve(replies);
};

exports.resetMap = function () {
  log.info("resetMap");

  const tempMaze = backtrack.gen(w, h);

  return mazedraw.draw(w, h, tempMaze, cellSize).then((mazeMap) => {
    log.info("resetMap callback", { w, h, cellSize });

    for (const uname in players) {
      setPlayerPosition(uname, {
        x: maze.startingPoint.col,
        y: maze.startingPoint.row,
      });
    }

    setMaze(tempMaze);

    return [
      reply("broadcast", {
        code: "initialize",
        players,
        map: mazeMap.toString("base64"),
        w,
        h,
      }),
    ];
  });
};

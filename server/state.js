const mazedraw = require("./mazedraw");
const backtrack = require("./backtrack");
const randomColor = require("randomcolor");
const assert = require("assert");

const { getLogger } = require("./log");
const { Walls } = require("./Walls");
const log = getLogger(module.filename);

const w = 10,
  h = 10,
  cellSize = 10;

function getReply(type, data) {
  return {
    type,
    data,
  };
}

class State {
  constructor() {
    this.walls = new Walls(backtrack.gen(w, h));
    this.players = {};
  }

  createPlayer(username, state) {
    log.info("createPlayer", { username, state });

    if (this.players[username]) {
      log.error("player already exists", {
        username,
        old: this.players[username],
        new: state,
      });
      return;
    }

    this.players[username] = state;
  }

  setPlayerPosition(username, position) {
    log.debug("setPlayerPosition", { username, position });

    assert.ok(this.players[username], username);

    Object.assign(this.players[username], position);
  }

  initializePlayer(username) {
    log.info("initializePlayer", { username });

    this.createPlayer(username, {
      ...this.walls.startPosition,
      color: randomColor(),
    });

    return mazedraw.draw(w, h, this.maze, cellSize).then((mazeMap) => {
      return [
        getReply("send", {
          code: "initialize",
          players: this.players,
          map: mazeMap.toString("base64"),
          w,
          h,
        }),
        getReply("broadcast", {
          code: "join",
          username: username,
          player: this.players[username],
        }),
      ];
    });
  }

  movePlayer(username, delta) {
    log.debug("movePlayer", { username, delta });

    assert.ok(this.players[username], username);

    const from = this.players[username];
    const to = {
      x: from.x + delta.x,
      y: from.y + delta.y,
    };

    log.debug("calculated positions", { username, from, to });

    let replies = [];

    if (this.walls.validMove(from, to)) {
      this.setPlayerPosition(username, to);

      replies.push(
        getReply("broadcast", {
          code: "update",
          username: username,
          player: this.players[username],
        })
      );

      if (this.walls.wins(to)) {
        replies.push(
          getReply("broadcast", {
            code: "win",
            username: username,
          })
        );
      }
    }

    return Promise.resolve(replies);
  }

  resetMap() {
    log.info("resetMap");

    const tempMaze = mazegen.gen(w, h);

    return mazedraw.draw(w, h, tempMaze, cellSize).then((mazeMap) => {
      log.info("resetMap callback", { w, h, cellSize });

      for (const uname in players) {
        this.setPlayerPosition(uname, {
          x: this.maze.startingPoint.col,
          y: this.maze.startingPoint.row,
        });
      }

      this.walls = new Walls(tempMaze);

      return [
        getReply("broadcast", {
          code: "initialize",
          players: this.players,
          map: mazeMap.toString("base64"),
          w,
          h,
        }),
      ];
    });
  }
}

exports.State = State;

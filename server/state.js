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
  constructor(services = {}) {
    this.mazegen = services.mazegen || require("./backtrack");
    this.mazedraw = services.mazedraw || require("./mazedraw");
    this.randomColor = services.randomColor || require("randomcolor");

    this.walls = new Walls(this.mazegen.gen(w, h), w, h);
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
      x: this.walls.maze.startingPoint.col,
      y: this.walls.maze.startingPoint.row,
      color: this.randomColor(),
    });

    return this.mazedraw
      .draw(w, h, this.walls.maze, cellSize)
      .then((mazeMap) => {
        log.debug("initializePlayer callback", { mazeMap });

        return [
          getReply("send", {
            code: "initialize",
            players: this.players,
            map: mazeMap,
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

    const tempMaze = this.mazegen.gen(w, h);

    return this.mazedraw.draw(w, h, tempMaze, cellSize).then((mazeMap) => {
      log.debug("resetMap callback", { mazeMap });

      for (const uname in players) {
        this.setPlayerPosition(uname, {
          x: this.walls.maze.startingPoint.col,
          y: this.walls.maze.startingPoint.row,
        });
      }

      this.walls = new Walls(tempMaze, w, h);

      return [
        getReply("broadcast", {
          code: "initialize",
          players: this.players,
          map: mazeMap,
          w,
          h,
        }),
      ];
    });
  }
}

exports.State = State;

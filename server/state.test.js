const assert = require("assert");
const mock = require("mock-require");

const mockMazedraw = {
  draw: function () {
    return Promise.resolve(Buffer.alloc(1024));
  },
};

const startingPoint = {
  row: 5,
  col: 5,
};
const end = {
  row: 5,
  col: 4,
};

const mockMazegen = {
  gen: function () {
    let walls = [];
    for (let i = 0; i < 10; i++) {
      walls.push([]);
      for (let j = 0; j < 10; j++) {
        walls[i].push([]);
      }
    }

    // Add wall between (5, 5) and (6, 5)
    walls[5][5].push({
      row: 6,
      col: 5,
    });
    walls[6][5].push({
      row: 5,
      col: 5,
    });

    const ends = [
      {
        point: end,
      },
    ];

    return {
      walls,
      startingPoint,
      ends,
    };
  },
};

mock("randomColor", function () {
  return "#def271";
});

const { getTestLogger } = require("./log");
mock("./log", {
  getLogger: getTestLogger(),
});

const { State } = require("./State");

function stateFactory() {
  return new State(mockMazegen, mockMazedraw);
}

describe("state", function () {
  describe("initializePlayer", function () {
    it("should succeed normally", function () {
      const state = stateFactory();

      return state.initializePlayer("benji");
    });

    it("should fail when we try to reinitialize a player", function () {
      const state = stateFactory();
      state.initializePlayer("benji").catch((ex) => assert.fail(ex));

      return state
        .initializePlayer("benji")
        .then((ex) => assert.fail(ex))
        .catch(() => assert.ok(true));
    });
  });

  describe("movePlayer", function () {
    let state;
    beforeEach(() => {
      state = stateFactory();
      state.initializePlayer("benji");
    });

    const deltas = [
      {
        x: 1,
        y: 0,
      },
      {
        x: -1,
        y: 0,
      },
      // This one is blocked by a wall for another test
      // {
      //   x: 0,
      //   y: 1,
      // },
      {
        x: 0,
        y: -1,
      },
    ];
    for (const delta of deltas) {
      it(`should be able to move (${delta.x}, ${delta.y}) from (${startingPoint.col}, ${startingPoint.row})`, function () {
        return state.movePlayer("benji", delta).then((messages) => {
          const m = messages[0];
          assert.equal(m.data.code, "update");
          assert.equal(startingPoint.col + delta.x, m.data.player.x);
          assert.equal(startingPoint.row + delta.y, m.data.player.y);
        });
      });
    }

    it(`should send a win when we get to (${end.col}, ${end.row})`, function () {
      const delta = {
        x: -1,
        y: 0,
      };

      return state.movePlayer("benji", delta).then((messages) => {
        assert.ok(
          messages.some(
            (m) =>
              m.data.code === "update" &&
              m.data.player.x === end.col &&
              m.data.player.y === end.row
          )
        );
        assert.ok(messages.some((m) => m.data.code === "win"));
      });
    });

    it(`should be blocked by a wall below (${startingPoint.col}, ${startingPoint.row})`, function () {
      const delta = {
        x: 0,
        y: 1,
      };

      return state
        .movePlayer("benji", delta)
        .then((messages) => assert.equal(messages.length, 0));
    });
  });
});

const { Walls } = require("./Walls");

const assert = require("assert");

describe("Walls", function () {
  describe("inBounds", function () {
    const mockMaze = {};
    const w = 6;
    const h = 8;
    const wall = new Walls(mockMaze, w, h);

    it("works for the outside", function () {
      const positions = [
        {
          y: 8,
          x: 3,
        },
        {
          y: -1,
          x: 3,
        },
        {
          y: 3,
          x: 6,
        },
        {
          y: 3,
          x: -1,
        },
      ];
      for (const pos of positions) {
        assert.equal(wall.inBounds(pos), false);
      }
    });

    it("works for inside", function () {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          assert.equal(
            wall.inBounds({
              y,
              x,
            }),
            true
          );
        }
      }
    });
  });
});

/*
Given a current cell as a parameter,
    Mark the current cell as visited
    While the current cell has any unvisited neighbour cells
        Choose one of the unvisited neighbours
        Remove the wall between the current cell and the chosen cell
        Invoke the routine recursively for a chosen cell
*/

const w = 6;
const h = 10;
let grid = Array(h)
  .fill()
  .map(() => Array(w).fill(false));

function getUnvisitedNeighbors(grid, r, c) {
  let n = [];

  if (r - 1 >= 0 && grid[r - 1][c] !== true) {
    n.push({
      row: r - 1,
      col: c,
    });
  }
  if (r + 1 < h && grid[r + 1][c] !== true) {
    n.push({
      row: r + 1,
      col: c,
    });
  }
  if (c - 1 >= 0 && grid[r][c - 1] !== true) {
    n.push({
      row: r,
      col: c - 1,
    });
  }
  if (c + 1 < w && grid[r][c + 1] !== true) {
    n.push({
      row: r,
      col: c + 1,
    });
  }

  return n;
}

function getWalls(w, h) {
  let walls = [];
  for (let r = 0; r < h; r++) {
    walls.push([]);
    for (let c = 0; c < w; c++) {
      walls[r].push([]);
      if (c - 1 >= 0) {
        walls[r][c].push({ row: r, col: c - 1 });
      }
      if (c + 1 < w) {
        walls[r][c].push({ row: r, col: c + 1 });
      }
      if (r - 1 >= 0) {
        walls[r][c].push({ row: r - 1, col: c });
      }
      if (r + 1 < h) {
        walls[r][c].push({ row: r + 1, col: c });
      }
    }
  }
  return walls;
}
let walls = getWalls(w, h);

const randInt = (limit) => Math.floor(Math.random() * limit);

function fill(grid, r, c) {
  grid[r][c] = true;
  let n = getUnvisitedNeighbors(grid, r, c);
  while (n.length > 0) {
    const idx = randInt(n.length);
    const o = n[idx];
    const or = o.row;
    const oc = o.col;
    if (n.length === 1) {
      n = [];
    } else {
      n = n.splice(idx, 1);
    }
    if (grid[or][oc] !== true) {
      grid[or][oc] = true;
      walls[r][c] = walls[r][c].filter(
        ({ row, col }) => row !== or || col !== oc
      );
      walls[or][oc] = walls[or][oc].filter(
        ({ row, col }) => row !== r || col !== c
      );
      fill(grid, or, oc);
    }
  }
}

while (
  grid
    .map((r) => r.filter((i) => i === false).length)
    .reduce((a, b) => a + b, 0) > 0
) {
  const unvisitedCells = grid
    .map((r, ir) =>
      r
        .map((e, ic) => (e === false ? { row: ir, col: ic } : null))
        .filter((e) => e != null)
    )
    .flat();
  const choice = unvisitedCells[randInt(unvisitedCells.length)];
  fill(grid, choice.row, choice.col);
}
console.log("done");
console.log(walls);
console.log(grid);

// const squareSize = 100;
// var fs = require("fs");
// var { createCanvas } = require("canvas"),
//   canvas = createCanvas(w * squareSize, h * squareSize),
//   ctx = canvas.getContext("2d");

// console.log("canvas", w * squareSize, h * squareSize);

sock = require("./socket");
sock.send(walls);

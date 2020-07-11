function vector(row, col) {
  return {
    row,
    col,
  };
}

function randInt(limit) {
  return Math.floor(Math.random() * limit);
}

function initGrid(w, h, initializer) {
  let grid = [];
  for (let r = 0; r < h; r++) {
    grid.push([]);
    for (let c = 0; c < w; c++) {
      grid[r].push(initializer());
    }
  }
  return grid;
}

function inBounds(r, c) {
  return r >= 0 && r < h && c >= 0 && c < w;
}

// Execute func for neighbors in a cross
function forCross(r, c, func) {
  func(r - 1, c);
  func(r + 1, c);
  func(r, c - 1);
  func(r, c + 1);
}

function initWalls(w, h) {
  let walls = initGrid(w, h, () => []);
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      forCross(r, c, (ar, ac) => {
        if (inBounds(ar, ac)) {
          walls[r][c].push(vector(ar, ac));
        }
      });
    }
  }
  return walls;
}

function getUnvisitedNeighbors(grid, r, c) {
  let n = [];
  forCross(r, c, (ar, ac) => {
    if (inBounds(ar, ac) && grid[ar][ac] !== true) {
      n.push(vector(ar, ac));
    }
  });
  return n;
}

// Remove b from a's walls
function disconnectOneWay(walls, a, b) {
  walls[a.row][a.col] = walls[a.row][a.col].filter(
    ({ row, col }) => row !== b.row || col !== b.col
  );
}

// DFS from row, col until we hit a dead end.
function search(grid, walls, row, col) {
  grid[row][col] = true;
  let unvisited = getUnvisitedNeighbors(grid, row, col);
  while (unvisited.length > 0) {
    const index = randInt(unvisited.length);
    const me = { row, col };
    const other = unvisited[index];

    unvisited.splice(index, 1);

    if (grid[other.row][other.col] !== true) {
      grid[other.row][other.col] = true;
      disconnectOneWay(walls, me, other);
      disconnectOneWay(walls, other, me);
      search(grid, walls, other.row, other.col);
    }
  }
}

// Backtracking DFS repeatedly until all cells have been visited
function generateMaze(w, h) {
  let grid = initGrid(w, h, () => false);
  let walls = initWalls(w, h);

  const getUnvisitedCellsInGrid = () =>
    grid
      .map((r, ir) =>
        r
          .map((e, ic) => (e === false ? { row: ir, col: ic } : null))
          .filter((e) => e != null)
      )
      .flat();
  const gridHasUnvisitedCells = () => getUnvisitedCellsInGrid().length > 0;

  while (gridHasUnvisitedCells()) {
    const unvisited = getUnvisitedCellsInGrid();
    const choice = unvisited[randInt(unvisited.length)];
    search(grid, walls, choice.row, choice.col);
  }

  return walls;
}

const w = 10,
  h = 10;
const maze = generateMaze(w, h);

sock = require("./socket");
sock.send(w, h, maze);

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

function inBounds(r, c, w, h) {
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
        if (inBounds(ar, ac, w, h)) {
          walls[r][c].push(vector(ar, ac));
        }
      });
    }
  }
  return walls;
}

function getUnvisitedNeighbors(grid, r, c, w, h) {
  let n = [];
  forCross(r, c, (ar, ac) => {
    if (inBounds(ar, ac, w, h) && grid[ar][ac] !== true) {
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
function search(grid, walls, w, h, row, col, length = 0) {
  grid[row][col] = true;
  let unvisited = getUnvisitedNeighbors(grid, row, col, w, h);

  if (unvisited.length == 0 && length) {
    return [
      {
        point: {
          row,
          col,
        },
        length,
      },
    ];
  }

  let all = [];

  while (unvisited.length > 0) {
    const index = randInt(unvisited.length);
    const me = { row, col };
    const other = unvisited[index];

    unvisited.splice(index, 1);

    if (grid[other.row][other.col] !== true) {
      grid[other.row][other.col] = true;
      disconnectOneWay(walls, me, other);
      disconnectOneWay(walls, other, me);

      const ends = search(grid, walls, w, h, other.row, other.col, length + 1);
      all.push(...ends);
    }
  }

  return all;
}

// Backtracking DFS repeatedly until all cells have been visited
function generateMaze(w, h) {
  let grid = initGrid(w, h, () => false);
  let walls = initWalls(w, h);

  const middle = {
    row: Math.floor(h / 2),
    col: Math.floor(w / 2),
  };
  const ends = search(grid, walls, w, h, middle.row, middle.col);
  console.log(ends);
  const threshold = 20;
  console.log("threshold", threshold);
  const choppedEnds = ends.filter((e) => e.length > threshold);
  const randomChoppedEnds = choppedEnds
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(3, ends.length));
  console.log("top");

  return {
    walls,
    startingPoint: middle,
    ends: randomChoppedEnds,
  };
}

exports.gen = generateMaze;

if (require.main === module) {
  const w = 10,
    h = 10;
  const maze = generateMaze(w, h);
  // console.log(maze);
  // console.log(start);
  mazedraw = require("../micro/mazedraw");
  mazedraw.draw(w, h, maze, (d) =>
    console.log(`Got a reply of ${d.length} bytes`)
  );
}

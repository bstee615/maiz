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
function search(grid, walls, w, h, row, col) {
  grid[row][col] = true;
  let unvisited = getUnvisitedNeighbors(grid, row, col, w, h);
  while (unvisited.length > 0) {
    const index = randInt(unvisited.length);
    const me = { row, col };
    const other = unvisited[index];

    unvisited.splice(index, 1);

    if (grid[other.row][other.col] !== true) {
      grid[other.row][other.col] = true;
      disconnectOneWay(walls, me, other);
      disconnectOneWay(walls, other, me);
      search(grid, walls, w, h, other.row, other.col);
    }
  }
}

function findGoodChoice(choices, w, h) {
  let best = null;
  const middle = {
    row: h / 2,
    col: w / 2,
  };

  for (const choice of choices) {
    const dist = {
      row: Math.abs(middle.row - choice.row),
      col: Math.abs(middle.col - choice.col),
    };

    const cartesianDistance = Math.sqrt(
      Math.pow(dist.row, 2) + Math.pow(dist.col, 2)
    );

    if (!best || best.distance < cartesianDistance) {
      best = {
        point: choice,
        distance: cartesianDistance,
      };
    }
  }

  return best.point;
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

  let allChoices = [];

  while (gridHasUnvisitedCells()) {
    // const choices = getUnvisitedCellsInGrid();
    const choices = [
      {
        row: Math.floor(h / 2),
        col: Math.floor(w / 2),
      },
    ];
    const start = choices[randInt(choices.length)];
    search(grid, walls, w, h, start.row, start.col);
    allChoices.push(start);
  }

  const startingPoint = findGoodChoice(allChoices, w, h);

  return {
    walls,
    startingPoint,
  };
}

exports.gen = generateMaze;

if (require.main === module) {
  const w = 10,
    h = 10;
  const result = generateMaze(w, h);
  const maze = result.walls;
  const start = result.startingPoint;
  // console.log(maze);
  console.log(start);
  mazedraw = require("./mazedraw");
  mazedraw.draw(w, h, maze, start, (d) =>
    console.log(`Got a reply of ${d.length} bytes`)
  );
}

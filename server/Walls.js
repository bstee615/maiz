const w = 10,
  h = 10,
  cellSize = 10;

function inBounds(pos) {
  return pos.x >= 0 && pos.x < w && pos.y >= 0 && pos.y < h;
}

class Walls {
  constructor(maze) {
    this.maze = maze;
  }

  wallBlocks(oldPos, newPos) {
    for (const other of this.maze.walls[oldPos.y][oldPos.x]) {
      if (other.col === newPos.x && other.row === newPos.y) {
        return true;
      }
    }
  }

  validMove(oldPos, newPos) {
    if (!inBounds(newPos)) {
      return false;
    }

    if (this.wallBlocks(oldPos, newPos)) {
      return false;
    }

    return true;
  }

  wins(playerPos) {
    for (const pos of this.maze.ends) {
      if (pos.point.row == playerPos.y && pos.point.col == playerPos.x) {
        return true;
      }
    }
    return false;
  }

  get startPosition() {
    return {
      x: this.maze.startingPoint.col,
      y: this.maze.startingPoint.row,
    };
  }
}
exports.Walls = Walls;

class Walls {
  constructor(maze, w, h) {
    this.maze = maze;
    this.w = w;
    this.h = h;
  }

  inBounds(pos) {
    return pos.x >= 0 && pos.x < this.w && pos.y >= 0 && pos.y < this.h;
  }

  wallBlocks(oldPos, newPos) {
    for (const other of this.maze.walls[oldPos.y][oldPos.x]) {
      if (other.col === newPos.x && other.row === newPos.y) {
        return true;
      }
    }
  }

  validMove(oldPos, newPos) {
    if (!this.inBounds(newPos)) {
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

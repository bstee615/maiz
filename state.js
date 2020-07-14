const mazedraw = require("./mazedraw");
const backtrack = require("./backtrack");

let positions = {};
let maze;

exports.doCmd = function (cmd, ctx) {
  switch (cmd.code) {
    case "initialize":
      ctx.setUsername(cmd.username);
      console.log("initialize", cmd.username);

      positions[cmd.username] = {
        x: 0,
        y: 0,
      };

      const w = 30,
        h = 30;
      if (!maze) {
        maze = backtrack.gen(w, h);
      }
      mazedraw.draw(w, h, maze, (mazeMap) =>
        ctx.send(
          JSON.stringify({
            code: "initialize",
            positions,
            map: mazeMap.toString("base64"),
          })
        )
      );
      break;
    case "move":
      let position = positions[ctx.username];
      position.x += cmd.delta.x;
      position.y += cmd.delta.y;

      console.log("moving", cmd.delta, "to", position);

      ctx.broadcast(
        JSON.stringify({
          code: "update",
          username: ctx.username,
          position,
        })
      );
      break;
    default:
      console.log("unhandled code", cmd);
      break;
  }
};

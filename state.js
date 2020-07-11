let positions = {};

exports.doCmd = function (cmd, ctx) {
  switch (cmd.code) {
    case "initialize":
      ctx.setUsername(cmd.username);
      console.log("initialize", cmd.username);

      positions[cmd.username] = {
        x: 0,
        y: 0,
      };

      ctx.send(
        JSON.stringify({
          code: "initialize",
          positions,
        })
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

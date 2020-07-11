var client = require("net").Socket();

exports.send = function (walls) {
  client.connect(2000, "localhost");
  client.write(JSON.stringify(walls));

  client.on("data", function (d) {
    console.log(d.toString());
  });

  client.end();
};

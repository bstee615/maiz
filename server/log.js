const bunyan = require("bunyan");
const process = require("process");

function getLogger(name, level = "debug") {
  return bunyan.createLogger({
    name,
    level,
    streams: [
      {
        level: level,
        stream: process.stdout,
      },
    ],
  });
}

exports = {
  getLogger,
};

if (require.main === module) {
  const log = getLogger("log");
  log.info("hi");

  const infoOnlyLog = getLogger("infoOnly", "info");
  infoOnlyLog.debug("should not show!");
  infoOnlyLog.info("hey!");
}

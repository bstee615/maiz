const bunyan = require("bunyan");
const process = require("process");

const PrettyStream = require("bunyan-prettystream");
const consoleStream = new PrettyStream();
consoleStream.pipe(process.stdout);

function getLogger(name, level = "debug") {
  return bunyan.createLogger({
    name,
    level,
    streams: [
      {
        level: level,
        stream: consoleStream,
        formatter: "pretty",
      },
    ],
  });
}
exports.getLogger = getLogger;

function getTestLogger(level = "fatal") {
  return function () {
    return bunyan.createLogger({
      name: "testLogger",
      level: level,
      streams: [
        {
          level: level,
          stream: consoleStream,
          formatter: "pretty",
        },
      ],
    });
  };
}
exports.getTestLogger = getTestLogger;

if (require.main === module) {
  const log = getLogger("log");
  log.info("hi");

  const infoOnlyLog = getLogger("infoOnly", "info");
  infoOnlyLog.debug("should not show!");
  infoOnlyLog.info("hey!");
}

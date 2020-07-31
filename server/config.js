if (process.env.NODE_ENV === "production") {
  exports.host = "0.0.0.0";
  exports.port = 80;

  exports.mazedraw = {
    host: "mazedraw",
    port: 3000,
  };
} else {
  exports.host = "127.0.0.1";
  exports.port = 4000;

  exports.mazedraw = {
    host: "127.0.0.1",
    port: 3000,
  };
}

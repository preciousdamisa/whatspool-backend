const config = require("config");

module.exports = function () {
  if (!config.get("db")) {
    throw new Error("FATAL ERROR: db is not defined.");
  }

  if (!config.get("jwtAuthPrivateKey")) {
    throw new Error("FATAL ERROR: jwtAuthPrivateKey is not defined.");
  }

  if (!config.get("flutterwaveSecretKey")) {
    throw new Error("FATAL ERROR: flutterwaveSecretKey is not defined");
  }
};

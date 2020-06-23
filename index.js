const app = require("express")();
const config = require("config");

require("./startup/logging")();
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();

const PORT = process.env.PORT || config.get("port");
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const io = require("./services/io-service").init(server);
io.on("connection", (socket) => {
  console.log("Client connected.");
});

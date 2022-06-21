const initWebsocketServer = require("./servers/websocketServer");
const cronjobServer = require("./servers/cronjobServer");
// const initHttpServer = require("./servers/httpMongoDbServer");
// initHttpServer();

const clients = {};
// initWebsocketServer(clients);
cronjobServer(clients);

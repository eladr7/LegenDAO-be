require("dotenv").config();

const webSocketServer = require("websocket").server;
const http = require("http");
const webSocketsServerPort = 8000;

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

const initWebsocketServer = (clients) => {
  // Spinning the http server and the websocket server.
  const server = http.createServer();
  server.listen(webSocketsServerPort);
  console.log("listening on port ", webSocketsServerPort);

  const wsServer = new webSocketServer({
    httpServer: server,
  });

  wsServer.on("request", function (request) {
    const userID = getUniqueID();
    console.log(
      new Date() +
        " Recieved a new connection from origin " +
        request.origin +
        "."
    );

    // We can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log(
      "connected: " + userID + " in " + Object.getOwnPropertyNames(clients)
    );

    // // When we get a message from this connection, broadcast it to all connections
    // connection.on("message", function (message) {
    //   if (message.type === "utf8") {
    //     console.log("Received Message: ", message.utf8Data);

    //     // broadcasting message to all connected clients
    //     for (key in clients) {
    //       clients[key].sendUTF(message.utf8Data);
    //       console.log("sent Message to: ", clients[key]);
    //     }
    //   }
    // });
  });
};

module.exports = initWebsocketServer;

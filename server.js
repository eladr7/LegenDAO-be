require("dotenv").config();

const webSocketServer = require("websocket").server;
const http = require("http");

const express = require("express");
const mongoose = require("mongoose");

const schedule = require("node-schedule");

const clients = {};
const webSocketsServerPort = 8000;
const httpPort = 3001;

// *******************************************************
// *******************************************************
// Cron job and update MongoDB:
var mongo = require("mongodb");

const MongoClient = require("mongodb").MongoClient;
const url = process.env.DATABASE_URL;

function request(method, url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = resolve;
    xhr.onerror = reject;
    xhr.send();
  });
}

var dbObject;
var dbCloser;
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  dbObject = db.db(process.env.DATABASE_NAME);
  dbCloser = db;
});

schedule.scheduleJob("* * * * *", () => {
  console.log("I ran");
  // Calculate the updated token info values and update the DB

  // Get the price of the token in USD:
  // request(
  //     'GET',
  //     'http://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=API-KEY-HERE',
  //   )
  //     .then((r1) => {
  //       const x1 = JSON.parse(r1.target.responseText);

  // Update the token info
  var o_id = new mongo.ObjectId(process.env.TOKEN_INFO_OBJECT_ID);
  var myquery = { _id: o_id };

  const updatedValuesObj = {
    apr: 8.5,
    apy: 16,
    liquidity: 100000000,
    priceUsd: 6.5,
    totalLocked: 30000000,
    dailyVolume: 50000000,
  };
  var newvalues = {
    $set: updatedValuesObj,
  };
  dbObject
    .collection(process.env.COLLECTION_NAME)
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      //   dbCloser.close()
    });

  // broadcasting message to all connected clients
  for (key in clients) {
    // clients[key].sendUTF(message.utf8Data);
    clients[key].send(JSON.stringify(updatedValuesObj));
    console.log("sent Message to: ", clients[key]);
  }
});
// *******************************************************
// *******************************************************

var initHttpServer = () => {
  const app = express();
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to Database"));

  app.use(express.json());

  const tokenInfoRouter = require("./routes/tokenInfoRoutes");
  app.use("/legendao", tokenInfoRouter);

  app.listen(httpPort, () =>
    console.log("THHP Server Started on port: ", httpPort)
  );
};

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

var initWebsocketServer = () => {
  // Spinning the http server and the websocket server.
  const server = http.createServer();
  server.listen(webSocketsServerPort);
  console.log("listening on port ", webSocketsServerPort);

  const wsServer = new webSocketServer({
    httpServer: server,
  });

  wsServer.on("request", function (request) {
    var userID = getUniqueID();
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

// initHttpServer();
initWebsocketServer();

require("dotenv").config();
const Mongo = require("mongodb");
const schedule = require("node-schedule");

const initWebsocketServer = require("./websocketServer");
const getUpdatedTokenInfoValues = require("../utils/tokenInfoFetch");

var databaseObj;
var mongoDb;
Mongo.MongoClient.connect(process.env.DATABASE_URL, function (err, db) {
  if (err) throw err;
  databaseObj = db.db(process.env.DATABASE_NAME);
  mongoDb = db;
});

const clients = {};

const broadcastToSubscribers = (updatedValuesObj) => {
  for (key in clients) {
    clients[key].send(JSON.stringify(updatedValuesObj));
    console.log("sent Message to: ", clients[key]);
  }
};

const cronjobServer = async () => {
  initWebsocketServer(clients);

  // Calculate the updated token info values and update the DB
  schedule.scheduleJob("* * * * *", async () => {
    console.log("Perform another cron job:");

    const updatedValuesObj = await getUpdatedTokenInfoValues();
    if (Object.keys(updatedValuesObj).length === 0) {
      // Fetching the data from osmosis failed; MongoDB should not get updated
      return;
    }

    // Get the query object
    const tokenInfoObjectId = new Mongo.ObjectId(
      process.env.TOKEN_INFO_OBJECT_ID
    );
    const queryBy = { _id: tokenInfoObjectId };

    const newvalues = { $set: updatedValuesObj };
    databaseObj
      .collection(process.env.COLLECTION_NAME)
      .updateOne(queryBy, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        mongoDb.close();
      });

    // broadcasting message to all connected clients
    broadcastToSubscribers(updatedValuesObj);
  });
};
module.exports = cronjobServer;

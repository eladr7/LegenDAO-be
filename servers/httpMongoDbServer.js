require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const httpPort = 3001;

const httpServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to Database"));

  const tokenInfoRouter = require("../routes/tokenInfoRoutes");
  app.use("/token", tokenInfoRouter);

  const collectionsDataRouter = require("../routes/collectionsRoutes");
  app.use("/collections", collectionsDataRouter);

  app.listen(httpPort, () =>
    console.log("HTTP Server Started on port: ", httpPort)
  );
};

module.exports = httpServer;

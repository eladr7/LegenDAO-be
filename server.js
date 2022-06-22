const cronjobServer = require("./servers/cronjobServer");
const initHttpServer = require("./servers/httpMongoDbServer");
const collectionsUploaderServer = require("./servers/collectionsDataUploader");

cronjobServer();
// initHttpServer();
// collectionsUploaderServer();

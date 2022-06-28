const cronjobServer = require("./servers/cronjobServer");
const initHttpServer = require("./servers/httpMongoDbServer");
const collectionsDataUploaderScript = require("./servers/collectionsDataUploader");

// cronjobServer();
// initHttpServer();
collectionsDataUploaderScript();

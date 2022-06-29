const cronjobServer = require("./servers/cronjobServer");
const httpServer = require("./servers/httpMongoDbServer");
const collectionsDataUploaderScript = require("./servers/collectionsDataUploader");

// cronjobServer();
httpServer();
// collectionsDataUploaderScript();

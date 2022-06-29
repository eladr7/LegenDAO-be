require("dotenv").config();
const Mongo = require("mongodb");
const fs = require("fs");

const uploadCollectionsData = async (collectionsData) => {
  Mongo.MongoClient.connect(process.env.DATABASE_URL, async function (err, db) {
    if (err) throw err;
    var databaseObj = db.db(process.env.DATABASE_NAME);
    var mongoDb = db;

    // Remove all previous entries!
    await databaseObj
      .collection(process.env.NFT_COLLECTIONS_COLLECTION_NAME)
      .deleteMany({ name: { $exists: "" } });

    const options = { ordered: true };
    databaseObj
      .collection(process.env.NFT_COLLECTIONS_COLLECTION_NAME)
      .insertMany(collectionsData, options, function (err, res) {
        if (err) throw err;
        console.log("NFT collections data updated successfuly");
        mongoDb.close();
      });
  });
};

// Loads the collections data from the current machine
const loadCollectionsData = () => {
  // Read the collections data JSON file
  const collectionsDataJson = JSON.parse(
    fs.readFileSync(process.env.NFT_COLLECTIONS_DATA_PATH)
  );

  // Create the collections data objects array.
  const collectionsDataToStore = [];
  collectionsDataJson.collectionsData.map((collectionData) => {
    const coverImgBinary = fs.readFileSync(
      process.env.NFT_COLLECTIONS_FILE_NAMES_PATH + collectionData.coverImg
    );

    const collectionStoreObject = {
      coverImg: {
        data: coverImgBinary,
        contentType: "image/png",
      },
      ...collectionData.info,
    };

    collectionsDataToStore.push(collectionStoreObject);
  });

  return collectionsDataToStore;
};

// Notice that this code will remove all previous collections data entries!!
const collectionsDataUploaderScript = async () => {
  const collectionsData = loadCollectionsData();
  await uploadCollectionsData(collectionsData);
};
module.exports = collectionsDataUploaderScript;

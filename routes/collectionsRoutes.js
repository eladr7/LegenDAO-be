const express = require("express");
const router = express.Router();
const NftCollection = require("../models/collection");

// Getting all
router.get("/data", async (req, res) => {
  try {
    const collections = await NftCollection.find();
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Getting One
router.get("/data:id", getNftCollection, (req, res) => {
  res.json(res.collection);
});

async function getNftCollection(req, res, next) {
  let collection;
  try {
    collection = await NftCollection.findById(req.params.id);
    if (collection == null) {
      return res.status(404).json({ message: "Cannot find the token info" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.collection = collection;
  next();
}

module.exports = router;

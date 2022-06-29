const mongoose = require("mongoose");

const nftCollectionSchema = new mongoose.Schema(
  {
    coverImg: {
      data: Buffer,
      contentType: String,
    },
    name: String,
    description: String,
    intro: String,
    artistDescription: String,
    artistName: String,
    startingDate: String,
    totalItemNum: String,
    mintPrice: String,
    mintPriceWL: String,
    nftContractAddress: String,
    minterContractAddress: String,
    onSale: String,
  },
  { collection: process.env.NFT_COLLECTIONS_COLLECTION_NAME }
);

module.exports = mongoose.model("NftCollection", nftCollectionSchema);

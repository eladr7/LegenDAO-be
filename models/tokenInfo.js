const mongoose = require("mongoose");

const test1Schema = new mongoose.Schema({
  apr: {
    type: Number,
    required: true,
  },
  apy: {
    type: Number,
    required: true,
  },
  liquidity: {
    type: Number,
    required: true,
  },
  dailyVolume: {
    type: Number,
    required: true,
  },
  priceUsd: {
    type: Number,
    required: true,
  },
  totalLocked: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Test1", test1Schema);

const express = require("express");
const router = express.Router();
const Test1 = require("../models/tokenInfo");

// Getting all
router.get("/info", async (req, res) => {
  try {
    const tokenInfo = await Test1.find();
    res.json(tokenInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Getting One
router.get("/info:id", getTokenInfo, (req, res) => {
  res.json(res.tokenInfo);
});

// Creating one
router.post("/info", async (req, res) => {
  const tokenInfo = new Test1({
    apr: req.body.apr,
    apy: req.body.apy,
    liquidity: req.body.liquidity,
    priceUsd: req.body.priceUsd,
    totalLocked: req.body.totalLocked,
    dailyVolume: req.body.dailyVolume,
  });
  try {
    const newTokenInfo = await tokenInfo.save();
    res.status(201).json(newTokenInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Updating One
router.patch("/info:id", getTokenInfo, async (req, res) => {
  if (req.body.apr != null) {
    res.tokenInfo.apr = req.body.apr;
  }
  if (req.body.apy != null) {
    res.tokenInfo.apy = req.body.apy;
  }
  if (req.body.liquidity != null) {
    res.tokenInfo.liquidity = req.body.liquidity;
  }
  if (req.body.priceUsd != null) {
    res.tokenInfo.priceUsd = req.body.priceUsd;
  }
  if (req.body.totalLocked != null) {
    res.tokenInfo.totalLocked = req.body.totalLocked;
  }
  if (req.body.dailyVolume != null) {
    res.tokenInfo.dailyVolume = req.body.dailyVolume;
  }
  try {
    const updatedTokenInfo = await res.tokenInfo.save();
    res.json(updatedTokenInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deleting One
router.delete("/info:id", getTokenInfo, async (req, res) => {
  try {
    await res.tokenInfo.remove();
    res.json({ message: "Deleted Token Info" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getTokenInfo(req, res, next) {
  let tokenInfo;
  try {
    tokenInfo = await Test1.findById(req.params.id);
    if (tokenInfo == null) {
      return res.status(404).json({ message: "Cannot find the token info" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.tokenInfo = tokenInfo;
  next();
}

module.exports = router;

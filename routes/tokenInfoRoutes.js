const express = require("express");
const router = express.Router();
const Test1 = require("../models/tokenInfo");

// Getting all
router.get("/info", async (req, res) => {
  try {
    const tokenInfo = await Test1.find();
    res.json(tokenInfo[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Getting One
router.get("/info:id", getTokenInfo, (req, res) => {
  res.json(res.tokenInfo);
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

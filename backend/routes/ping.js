const express = require('express');
const router = express.Router();
const Community = require('../models/Community');

router.get("/", (req, res) => {
    res.status(200).json({message: "pong"});
});

router.get('/communities', async (req, res) => {
  try {
    const communities = await Community.find().select('name transId _id');
    res.status(200).json({ communities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
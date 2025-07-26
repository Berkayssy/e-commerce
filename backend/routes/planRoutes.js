const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');

// Public: Planları listele
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 
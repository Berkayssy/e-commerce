const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const verifyAdmin = require('../middlewares/verifyAdmin');
const authMiddleware = require('../middlewares/authMiddleware');

// Admin dashboard stats
router.get('/dashboard', authMiddleware, verifyAdmin, getDashboardStats);

module.exports = router; 
const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifySeller, verifyAdmin } = require('../middlewares/verifyAdmin');

// Public routes
router.post('/register', sellerController.registerSeller);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, verifySeller, sellerController.getSellerProfile);
router.get('/my-community', authMiddleware, verifySeller, sellerController.getMyCommunity);
router.put('/profile', authMiddleware, verifySeller, sellerController.updateSellerProfile);
router.put('/billing', authMiddleware, verifySeller, sellerController.updateBillingInfo);
router.get('/plan-status', authMiddleware, verifySeller, sellerController.getPlanStatus);
router.put('/change-plan', authMiddleware, verifySeller, sellerController.changePlan);
router.post('/assign-admin', authMiddleware, verifySeller, sellerController.assignAdmin);

// Admin only routes

module.exports = router; 
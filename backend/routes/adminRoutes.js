const express = require('express');
const router = express.Router();
const { getDashboardStats, createCommunity, addAdminToCommunity, removeAdminFromCommunity, getCommunityDetails, getCommunities, createOnboardingStore, createSubscription, createPlan, getPlans, getPlanById, updatePlan, deletePlan, getSubscriptions, getAdminEmails, addAdminEmail, removeAdminEmail, makeUserAdmin, removeAdminRole } = require('../controllers/adminController');
const { verifyAdmin, verifySeller } = require('../middlewares/verifyAdmin');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Admin dashboard stats
router.get('/dashboard', authMiddleware, verifyAdmin, getDashboardStats);

// Community management routes
router.post('/community', authMiddleware, verifyAdmin, createCommunity);
router.post('/community/add-admin', authMiddleware, verifyAdmin, addAdminToCommunity);
router.post('/community/remove-admin', authMiddleware, verifyAdmin, removeAdminFromCommunity);
router.get('/community/:communityId', authMiddleware, verifyAdmin, getCommunityDetails);
router.get('/community-list', authMiddleware, getCommunities);
router.post('/onboarding/create-store', authMiddleware, upload.single('logo'), createOnboardingStore);
router.post('/subscriptions', createSubscription);
router.get('/subscriptions', authMiddleware, verifyAdmin, getSubscriptions);

// Plan management routes
router.post('/plans', authMiddleware, verifyAdmin, createPlan);
router.get('/plans', authMiddleware, verifyAdmin, getPlans);
router.get('/plans/:id', authMiddleware, verifyAdmin, getPlanById);
router.put('/plans/:id', authMiddleware, verifyAdmin, updatePlan);
router.delete('/plans/:id', authMiddleware, verifyAdmin, deletePlan);

// Admin email management routes
router.get('/admin-emails', authMiddleware, verifyAdmin, getAdminEmails);
router.post('/admin-emails', authMiddleware, verifyAdmin, addAdminEmail);
router.delete('/admin-emails/:email', authMiddleware, verifyAdmin, removeAdminEmail);

// User role management routes
router.put('/users/:userId/make-admin', authMiddleware, verifyAdmin, makeUserAdmin);
router.put('/users/:userId/remove-admin', authMiddleware, verifyAdmin, removeAdminRole);

module.exports = router; 
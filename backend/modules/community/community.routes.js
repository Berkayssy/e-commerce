const express = require('express');
const router = express.Router();
const controller = require('./community.controller');
const { validate } = require('../../middlewares/validationMiddleware');
const verifyToken = require('../../middlewares/verifyToken');
const { createCommunityValidator, addAdminValidator } = require('./community.validator');

// CRUD-like routes
router.post('/', verifyToken, createCommunityValidator, validate, controller.createCommunity);
router.get('/', controller.getCommunities);
router.post('/onboarding', verifyToken, controller.createOnboardingStore);
router.get('/dashboard', verifyToken, controller.getDashboardStats);
router.get('/:communityId', controller.getCommunityDetails);
router.post('/add-admin', verifyToken, addAdminValidator, validate, controller.addAdminToCommunity);

module.exports = router;
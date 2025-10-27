const express = require('express');
const router = express.Router();
const controller = require('./plan.controller');
const { validate } = require('../../middlewares/validationMiddleware');
const verifyToken = require('../../middlewares/verifyToken');
const { createPlanValidator, changePlanValidator, getPlanByIdValidator } = require('./plan.validator');

// Admin-only creation (you can protect with roleMiddleware('admin') if available)
router.post('/', verifyToken, createPlanValidator, validate, controller.createPlan);

// public list
router.get('/', controller.getPlans);

// seller-only endpoints
router.get('/status', verifyToken, controller.getPlanStatus);
router.post('/change', verifyToken, changePlanValidator, validate, controller.changePlan);

router.get('/:id', getPlanByIdValidator, validate, controller.getPlanById);

module.exports = router;
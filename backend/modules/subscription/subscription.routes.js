const express = require("express");
const router = express.Router();

const subscriptionController = require("./subscription.controller");
const { validateRequest } = require("../../middlewares/validationMiddleware");
const { createSubscriptionValidator } = require("./subscription.validator");

// 🧩 CREATE Subscription
router.post(
  "/",
  createSubscriptionValidator,
  validateRequest,
  subscriptionController.createSubscription
);

// 🧩 GET User Subscriptions
router.get("/", subscriptionController.getSubscriptions);

module.exports = router;

const express = require("express");
const router = express.Router();
const onboardingController = require("../onboarding/onboarding.controller");
const { validate } = require("../../../middlewares/validationMiddleware");
const verifyToken = require("../../../middlewares/verifyToken");
const onboardingValidators = require("../onboarding/onboarding.validator");

// All routes require authentication
router.use(verifyToken);

// Onboarding flow routes
router.post(
  "/start",
  onboardingValidators.startOnboardingValidator,
  validate,
  onboardingController.startOnboarding
);

router.put(
  "/store-info",
  onboardingValidators.storeInfoValidator,
  validate,
  onboardingController.updateStoreInfo
);

router.put(
  "/select-plan",
  onboardingValidators.planSelectionValidator,
  validate,
  onboardingController.selectPlan
);

router.put(
  "/setup-payment",
  onboardingValidators.paymentSetupValidator,
  validate,
  onboardingController.setupPayment
);

router.post("/complete", onboardingController.completeOnboarding);

router.get("/status", onboardingController.getOnboardingStatus);

module.exports = router;

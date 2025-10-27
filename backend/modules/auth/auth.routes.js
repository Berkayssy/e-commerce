const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");
const { validate } = require("../../middlewares/validationMiddleware");
const verifyToken = require("../../middlewares/verifyToken");
const authValidators = require("./auth.validator");

router.post(
  "/login",
  authValidators.loginValidator,
  validate,
  controller.login
);
router.post("/refresh", controller.refreshToken);
router.post("/register", controller.register);

router.post(
  "/google",
  validate,
  authValidators.googleLoginValidator,
  controller.googleAuthLogin
);
router.get("/google/callback", controller.googleOAuthCallback);

router.post(
  "/forgot-password",
  authValidators.forgotPasswordValidator,
  validate,
  controller.forgotPassword
);
router.post(
  "/reset-password/:token",
  authValidators.resetPasswordValidator,
  validate,
  controller.resetPassword
);

router.post("/send-verification", controller.sendVerification);
router.post("/verify-email", controller.verifyEmail);
router.post("/resend-verification", controller.resendVerification);

router.get("/me", verifyToken, controller.getCurrentUser);
router.post("/logout", verifyToken, controller.logout);

module.exports = router;

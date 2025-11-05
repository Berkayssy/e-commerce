const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");
const { validate } = require("../../middlewares/validationMiddleware");
const verifyToken = require("../../middlewares/verifyToken");
const authValidators = require("./auth.validator");

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post(
  "/login",
  authValidators.loginValidator,
  validate,
  controller.login
);

router.post("/refresh", controller.refreshToken);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Internal server error
 */
router.post("/register", controller.register);

router.get(
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

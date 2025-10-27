// modules/auth/auth.validator.js - GÜNCELLE
const { body } = require("express-validator");

exports.loginValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Password is required"),
];

exports.registerValidator = [
  body("firstName")
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage("First name must be between 1 and 50 characters"),

  body("lastName")
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage("Last name must be between 1 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must contain at least one special character"),
];

exports.googleLoginValidator = [
  body("token").isLength({ min: 1 }).withMessage("Google token is required"),
];

exports.googleRegisterValidator = [
  body("token").isLength({ min: 1 }).withMessage("Google token is required"),
];

exports.forgotPasswordValidator = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
];

exports.resetPasswordValidator = [
  body("password")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

exports.sendVerificationValidator = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
];

const { body, param } = require("express-validator");

exports.strongPasswordValidator = [
  body("password")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must contain at least one special character"),
];

exports.updateProfileValidator = [
  body("firstName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

exports.userIdValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];
exports.getUserProfileValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

exports.updateUserProfileValidator = [
  body("firstName").isString(),
  body("lastName").isString(),
  body("email").isEmail().normalizeEmail(),
];

exports.loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

exports.registerValidator = [
  body("firstName").isString(),
  body("lastName").isString(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

exports.changePasswordValidator = [body("password").isLength({ min: 6 })];

exports.forgotPasswordValidator = [body("email").isEmail().normalizeEmail()];

exports.resetPasswordValidator = [body("password").isLength({ min: 6 })];

exports.changePasswordValidator = [...strongPasswordValidator];

exports.resetPasswordValidator = [...strongPasswordValidator];

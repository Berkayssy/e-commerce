const { body } = require("express-validator");

exports.startOnboardingValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("surname")
    .notEmpty()
    .withMessage("Surname is required")
    .isLength({ min: 2 })
    .withMessage("Surname must be at least 2 characters"),
];

exports.storeInfoValidator = [
  body("storeName")
    .notEmpty()
    .withMessage("Store name is required")
    .isLength({ min: 3 })
    .withMessage("Store name must be at least 3 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Store name can only contain letters, numbers and spaces"),

  body("storeDescription")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Store description must be less than 500 characters"),

  body("storeType")
    .optional()
    .isIn(["fashion", "electronics", "home", "beauty", "food", "other"])
    .withMessage("Invalid store type"),
];

exports.planSelectionValidator = [
  body("planType")
    .notEmpty()
    .withMessage("Plan type is required")
    .isIn(["basic", "pro", "enterprise"])
    .withMessage("Invalid plan type"),

  body("billingCycle")
    .optional()
    .isIn(["monthly", "yearly"])
    .withMessage("Invalid billing cycle"),
];

exports.paymentSetupValidator = [
  body("cardNumber")
    .notEmpty()
    .withMessage("Card number is required")
    .isCreditCard()
    .withMessage("Invalid card number"),

  body("cardExpiry")
    .notEmpty()
    .withMessage("Card expiry is required")
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
    .withMessage("Invalid expiry date format (MM/YY)"),

  body("cardCvv")
    .notEmpty()
    .withMessage("CVV is required")
    .isLength({ min: 3, max: 4 })
    .withMessage("CVV must be 3 or 4 digits"),

  body("billingAddress")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Billing address must be at least 10 characters"),
];

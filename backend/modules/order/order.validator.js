// modules/order/order.validator.js - GÜNCELLE
const { body } = require("express-validator");

exports.createOrderValidator = [
  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required"),
  body("products.*.product").isMongoId().withMessage("Invalid product ID"),
  body("products.*.quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
  body("totalPrice")
    .isFloat({ min: 0.01 })
    .withMessage("Total price must be a positive number"),
  body("contactInfo.fullName")
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage("Full name is required and must be less than 100 characters"),
  body("contactInfo.phone")
    .isLength({ min: 1, max: 20 })
    .trim()
    .escape()
    .withMessage("Valid phone number is required"),
  body("contactInfo.email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("contactInfo.address")
    .isLength({ min: 1, max: 200 })
    .trim()
    .escape()
    .withMessage("Address is required and must be less than 200 characters"),
  body("paymentInfo.cardHolder")
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage("Card holder name is required"),
  body("paymentInfo.cardLast4")
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage("Valid card last 4 digits are required"),
  body("paymentInfo.expiry")
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)
    .withMessage("Valid expiry date required (MM/YY)"),
];

exports.validateUpdateStatus = [
  body("status")
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status value"),
];

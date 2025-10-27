const { body, param, query } = require("express-validator");

exports.createProductValidator = [
  body("name")
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage("Product name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .escape()
    .withMessage("Description must be less than 1000 characters"),
  body("price")
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Price must be a positive number between 0.01 and 1,000,000"),
  body("stock")
    .isInt({ min: 0, max: 100000 })
    .withMessage("Stock must be a positive integer between 0 and 100,000"),
  body("category")
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage("Category must be between 1 and 50 characters"),
  body("brand")
    .optional()
    .isLength({ max: 50 })
    .trim()
    .escape()
    .withMessage("Brand must be less than 50 characters"),
];

exports.updateProductValidator = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage("Product name must be between 1 and 100 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .escape()
    .withMessage("Description must be less than 1000 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Price must be a positive number between 0.01 and 1,000,000"),
  body("stock")
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage("Stock must be a positive integer between 0 and 100,000"),
  body("category")
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage("Category must be between 1 and 50 characters"),
];

exports.getProductByIdValidator = [
  param("id").isMongoId().withMessage("Invalid product ID"),
];

exports.getAllProductsValidator = [
  query("communityId")
    .optional()
    .isMongoId()
    .withMessage("Invalid communityId"),
];

exports.deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID"),
];

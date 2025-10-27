// validators/searchValidator.js
const { query } = require("express-validator");

exports.searchValidator = [
  query("q")
    .notEmpty()
    .withMessage("Search query (q) is required")
    .isString()
    .trim(),
  query("type")
    .optional()
    .isIn(["all", "products", "communities", "plans"])
    .withMessage("Invalid type value"),
];
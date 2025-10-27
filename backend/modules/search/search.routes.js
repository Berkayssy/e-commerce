const express = require("express");
const router = express.Router();

const searchController = require("./search.controller");
const { validate } = require("../../middlewares/validationMiddleware");
const authMiddleware = require("../../middlewares/authMiddleware");
const { searchValidator } = require("./search.validator");

// 🔍 Global Search
router.get(
  "/",
  authMiddleware,
  searchValidator,
  validate,
  searchController.globalSearch
);

module.exports = router;

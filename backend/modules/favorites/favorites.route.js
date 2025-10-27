const express = require("express");
const router = express.Router();
const controller = require("./favorites.controller");
const {
  addToFavoritesValidator,
  removeFromFavoritesValidator,
  checkFavoriteValidator,
  getFavoriteCountValidator,
} = require("./favorites.validator");
const { validate } = require("../../middlewares/validationMiddleware");
const verifyToken = require("../../middlewares/verifyToken");

router.post(
  "/",
  verifyToken,
  addToFavoritesValidator,
  validate,
  controller.addToFavorites
);
router.delete(
  "/",
  verifyToken,
  removeFromFavoritesValidator,
  validate,
  controller.removeFromFavorites
);
router.get(
  "/check",
  verifyToken,
  checkFavoriteValidator,
  validate,
  controller.checkFavorite
);
router.get(
  "/count/:productId",
  getFavoriteCountValidator,
  validate,
  controller.getFavoriteCount
);
router.get("/", verifyToken, controller.getUserFavorites);

module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const authenticate = require("../../middlewares/authMiddleware"); // 👈 dikkat
const {
  createProductValidator,
  updateProductValidator,
} = require("./product.validator");

router.post(
  "/",
  authenticate,
  createProductValidator,
  productController.createProduct
);
router.put(
  "/:id",
  authenticate,
  updateProductValidator,
  productController.updateProduct
);
router.delete("/:id", authenticate, productController.deleteProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/search/advanced", productController.advancedSearch);
router.get("/filters/categories", productController.getCategoryFilters);
router.put("/:id/stock", authenticate, productController.updateProductStock);
router.get("/seller/:sellerId", productController.getSellerProducts);
module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

// All users can access
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Only admin can access
router.post("/", verifyToken, productController.createProducts);
router.put("/:id", verifyToken, productController.updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;
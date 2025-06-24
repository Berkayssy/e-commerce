const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");
const upload = require('../middlewares/uploadMiddleware');

// All users can access
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Only admin can access
router.post("/", verifyToken, upload.array('images', 10), productController.createProducts);
router.put("/:id", verifyToken, productController.updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;
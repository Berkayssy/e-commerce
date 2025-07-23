const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../middlewares/authMiddleware");
const { verifySeller, verifyAdmin } = require("../middlewares/verifyAdmin");
const upload = require('../middlewares/uploadMiddleware');
const checkActivePlan = require("../middlewares/planMiddleware");
const Plan = require('../models/Plan');
const multer = require('multer');

// All users can access
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Public: Planları listele
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Only admin can access
router.post(
  "/",
  (req, res, next) => {
    upload.array('images', 10)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: err.message });
      }
      next();
    });
  },
  (req, res, next) => {
    verifyToken(req, res, next);
  },
  (req, res, next) => {
    verifySeller(req, res, next);
  },
  (req, res, next) => {
    checkActivePlan(req, res, next);
  },
  (req, res, next) => {
    productController.createProducts(req, res, next);
  }
);
router.put("/:id", verifyToken, upload.array('images', 10), productController.updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;
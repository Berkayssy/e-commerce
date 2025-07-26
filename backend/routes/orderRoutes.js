const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middlewares/authMiddleware");
const { verifyAdmin, verifySeller } = require("../middlewares/verifyAdmin");


router.post("/", verifyToken, orderController.createOrder); // Create an order
router.get("/", verifyToken, verifySeller, orderController.getAllOrders); // Admin and Seller can get all orders
router.get("/my", verifyToken, orderController.getMyOrders); // User can get their own orders
router.put("/:id", verifyToken, verifyAdmin, orderController.updateOrderStatus); // Admin can update order status

module.exports = router;
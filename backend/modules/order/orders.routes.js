const express = require("express");
const router = express.Router();
const controller = require("./orders.controller");
const auth = require("../../middlewares/authMiddleware");

router.post("/", auth, controller.createOrder);
router.get("/my", auth, controller.getMyOrders);
router.get("/", auth, controller.getAllOrders);
router.patch("/:id/status", auth, controller.updateOrderStatus);
router.get("/:id", auth, controller.getOrderById);
router.get("/seller/:sellerId", auth, controller.getSellerOrders);
router.get("/analytics/dashboard", auth, controller.getOrderAnalytics);

module.exports = router;

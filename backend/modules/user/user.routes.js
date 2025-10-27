const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const verifyToken = require("../../middlewares/verifyToken");
const verifyAdmin = require("../../middlewares/verifyAdmin");

// 🚀 USER PROFILE ENDPOINTS
router.get("/profile", verifyToken, userController.getUserProfile);
router.put("/profile", verifyToken, userController.updateUserProfile);

// 🚀 USER MANAGEMENT (Admin only)
router.get("/", verifyAdmin, userController.getAllUsers);
router.get("/count", verifyAdmin, userController.countUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.delete("/:id", verifyAdmin, userController.deleteUser);

module.exports = router;

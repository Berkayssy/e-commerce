const express = require("express");
const router = express.Router();

const sellerController = require("./seller.controller");
const { validateRequest } = require("../../middlewares/validationMiddleware");
const {
  updateSellerProfileValidator,
  assignAdminValidator,
  removeAdminValidator,
} = require("./seller.validator");

const verifyToken = require("../../middlewares/verifyToken");

// 🧩 GET Seller Profile
router.get("/profile", sellerController.getSellerProfile);

// 🧩 UPDATE Seller Profile
router.put(
  "/profile",
  updateSellerProfileValidator,
  validateRequest,
  sellerController.updateSellerProfile
);

// 🧩 ASSIGN ADMIN
router.post(
  "/assign-admin",
  assignAdminValidator,
  validateRequest,
  sellerController.assignAdmin
);

// 🧩 GET ADMIN EMAILS (by community)
router.get("/:communityId/admin-emails", sellerController.getAdminEmails);

// 🧩 REMOVE ADMIN FROM COMMUNITY
router.delete(
  "/:communityId/remove-admin",
  removeAdminValidator,
  validateRequest,
  sellerController.removeAdminFromCommunity
);
router.get("/dashboard", verifyToken, sellerController.getSellerDashboard);
router.get("/analytics", verifyToken, sellerController.getSellerAnalytics);
router.get("/performance", verifyToken, sellerController.getSellerPerformance);

module.exports = router;

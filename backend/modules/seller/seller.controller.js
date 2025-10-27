const sellerService = require("../seller/seller.service");

exports.createSeller = async (req, res) => {
  const result = await sellerService.createSeller(req.body);
  return res.status(result.status || 200).json(result.data);
};
exports.getSellerProfile = async (req, res) => {
  const result = await sellerService.getSellerProfile(req.user.sellerId);
  return res.status(result.status || 200).json(result.data);
};

exports.updateSellerProfile = async (req, res) => {
  const result = await sellerService.updateSellerProfile(
    req.user.sellerId,
    req.body
  );
  return res.status(result.status || 200).json(result.data);
};

exports.assignAdmin = async (req, res) => {
  const result = await sellerService.assignAdmin(
    req.user.sellerId,
    req.body.email
  );
  return res.status(result.status || 200).json(result.data);
};

exports.getAdminEmails = async (req, res) => {
  const result = await sellerService.getAdminEmails(req.params.communityId);
  return res.status(result.status || 200).json(result.data);
};

exports.removeAdminFromCommunity = async (req, res) => {
  const result = await sellerService.removeAdminFromCommunity(
    req.params.communityId,
    req.params.adminId
  );
  return res.status(result.status || 200).json(result.data);
};
// modules/seller/seller.controller.js - EKLE
exports.getSellerDashboard = async (req, res) => {
  const result = await sellerService.getSellerDashboard(req.user._id);
  return res.status(result.status || 200).json(result.data || result);
};

exports.getSellerAnalytics = async (req, res) => {
  const result = await sellerService.getSellerAnalytics(req.user._id);
  return res.status(result.status || 200).json(result.data || result);
};

exports.getSellerPerformance = async (req, res) => {
  const result = await sellerService.getSellerPerformance(req.user._id);
  return res.status(result.status || 200).json(result.data || result);
};

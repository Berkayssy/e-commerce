// modules/seller/seller.service.js - GÜNCELLE
const mongoose = require("mongoose");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const Community = require("../../models/Community");
const Notification = require("../../models/Notification");
const OrderCache = require("../../cache/orderCache"); // ✅ YENİ
const Product = require("../../models/Product"); // ✅ Analytics için
const Order = require("../../models/Order"); // ✅ Analytics için

exports.getSellerDashboard = async (sellerId) => {
  try {
    if (!sellerId)
      return { status: 400, success: false, message: "Seller ID is required" };

    // ✅ Önce cache'den kontrol et
    const cachedDashboard = await OrderCache.getSellerDashboard(sellerId);
    if (cachedDashboard) {
      console.log(
        `✅ Seller dashboard served from cache for seller ${sellerId}`
      );
      return {
        ...cachedDashboard,
        cached: true,
      };
    }

    // Get seller info
    const seller = await Seller.findById(sellerId)
      .populate("userId", "firstName lastName email")
      .populate("storeId", "name logo")
      .populate("planId", "name price durationDays");

    if (!seller)
      return { status: 404, success: false, message: "Seller not found" };

    // Get seller's communities
    const sellerCommunities = await Community.find({
      $or: [{ owner: sellerId }, { admins: sellerId }],
    });

    const communityIds = sellerCommunities.map((community) => community._id);

    // Get quick stats
    const productStats = await Product.aggregate([
      { $match: { communityId: { $in: communityIds } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ["$stock", 5] }, 1, 0] },
          },
        },
      },
    ]);

    const orderStats = await Order.aggregate([
      { $match: { communityIds: { $in: communityIds } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    const productResult = productStats[0] || {
      totalProducts: 0,
      totalStock: 0,
      lowStockProducts: 0,
    };
    const orderResult = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
    };

    // Get recent orders
    const recentOrders = await Order.find({
      communityIds: { $in: communityIds },
    })
      .populate("user", "firstName lastName email")
      .populate("products.product", "name price")
      .sort({ createdAt: -1 })
      .limit(5);

    const result = {
      status: 200,
      success: true,
      data: {
        seller: {
          id: seller._id,
          name: seller.name,
          store: seller.storeId,
          plan: seller.planId,
          status: seller.status,
        },
        overview: {
          products: {
            total: productResult.totalProducts,
            stock: productResult.totalStock,
            lowStock: productResult.lowStockProducts,
          },
          orders: {
            total: orderResult.totalOrders,
            revenue: orderResult.totalRevenue,
            pending: orderResult.pendingOrders,
          },
          communities: sellerCommunities.length,
        },
        recentOrders: recentOrders,
        quickActions: [
          { label: "Add Product", action: "create_product", icon: "➕" },
          { label: "View Orders", action: "view_orders", icon: "📦" },
          { label: "Manage Stock", action: "manage_stock", icon: "📊" },
        ],
      },
    };

    // ✅ Cache'e kaydet
    await OrderCache.setSellerDashboard(sellerId, result);
    console.log(`✅ Seller dashboard cached for seller ${sellerId}`);

    return { ...result, cached: false };
  } catch (error) {
    return handleServiceError(error, "getSellerDashboard");
  }
};

// ✅ Seller cache invalidation için mevcut methodları güncelle
exports.updateSellerProfile = async (sellerId, body) => {
  try {
    // ... mevcut update logic

    await seller.save();

    // ✅ Seller cache'lerini temizle
    await OrderCache.invalidateOrderCaches(sellerId);
    console.log(`✅ Seller caches invalidated for profile update`);

    return {
      status: 200,
      success: true,
      message: "Seller profile updated successfully",
      data: seller,
    };
  } catch (error) {
    return handleServiceError(error, "updateSellerProfile");
  }
};

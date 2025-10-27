// modules/order/orders.service.js - GÜNCELLE
const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Community = require("../../models/Community");
const OrderCache = require("../../cache/orderCache"); // ✅ YENİ

exports.getOrderById = async (id) => {
  try {
    // ✅ Önce cache'den kontrol et
    const cachedOrder = await OrderCache.getOrderById(id);
    if (cachedOrder) {
      console.log(`✅ Order ${id} served from cache`);
      return {
        success: true,
        status: 200,
        order: cachedOrder,
        cached: true,
      };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, status: 400, message: "Invalid order ID" };
    }

    const order = await Order.findById(id)
      .populate("user", "firstName lastName email")
      .populate("products.product")
      .populate("communityIds", "name transId");

    if (!order) {
      return { success: false, status: 404, message: "Order not found" };
    }

    // ✅ Cache'e kaydet
    await OrderCache.setOrderById(id, order);
    console.log(`✅ Order ${id} cached`);

    return { success: true, status: 200, order, cached: false };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to fetch order",
      details: error.message,
    };
  }
};

exports.getOrderAnalytics = async (user) => {
  try {
    let matchQuery = {};

    // If user is seller, only show their community analytics
    if (user.role === "seller") {
      const sellerCommunities = await Community.find({
        $or: [{ owner: user._id }, { admins: user._id }],
      });
      const communityIds = sellerCommunities.map((community) => community._id);
      matchQuery.communityIds = { $in: communityIds };

      // ✅ Seller analytics için cache kontrol
      const cachedAnalytics = await OrderCache.getSellerAnalytics(user._id);
      if (cachedAnalytics) {
        console.log(
          `✅ Seller analytics served from cache for seller ${user._id}`
        );
        return {
          ...cachedAnalytics,
          cached: true,
        };
      }
    }

    const analytics = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $group: {
          _id: null,
          statusCounts: { $push: { status: "$_id", count: "$count" } },
          totalOrders: { $sum: "$count" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: 1,
          statusCounts: 1,
        },
      },
    ]);

    const result = analytics[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      statusCounts: [],
    };

    // Get recent orders for dashboard
    const recentOrders = await Order.find(matchQuery)
      .populate("user", "firstName lastName")
      .populate("products.product", "name price")
      .sort({ createdAt: -1 })
      .limit(5);

    const finalResult = {
      success: true,
      status: 200,
      analytics: {
        ...result,
        recentOrders,
      },
    };

    // ✅ Cache'e kaydet (sadece seller için)
    if (user.role === "seller") {
      await OrderCache.setSellerAnalytics(user._id, finalResult);
      console.log(`✅ Seller analytics cached for seller ${user._id}`);
    }

    return { ...finalResult, cached: false };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to fetch analytics",
      details: error.message,
    };
  }
};

// ✅ Yeni order oluştuğunda cache'i temizle
exports.createOrder = async (user, body) => {
  try {
    const { products, totalPrice, contactInfo, paymentInfo } = body;

    // Validate products exist
    const productsWithCommunity = await Promise.all(
      products.map(async (item) => {
        const productDoc = await Product.findById(item.product);
        if (!productDoc) throw new Error(`Product not found: ${item.product}`);
        return {
          ...item,
          product: productDoc._id,
          communityId: productDoc.communityId,
        };
      })
    );

    const communityIds = [
      ...new Set(
        productsWithCommunity.map((p) => String(p.communityId)).filter(Boolean)
      ),
    ];

    const newOrder = new Order({
      user: user._id,
      products: productsWithCommunity,
      totalPrice,
      contactInfo,
      paymentInfo,
      communityIds,
    });

    const savedOrder = await newOrder.save();

    // ✅ Order cache'lerini temizle
    await OrderCache.invalidateOrderCaches(user._id);
    console.log(`✅ Order caches invalidated for new order`);

    return {
      success: true,
      status: 201,
      message: "Order created successfully",
      order: savedOrder,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to create order",
      details: error.message,
    };
  }
};

// ✅ Order status güncellendiğinde cache'i temizle
exports.updateOrderStatus = async (user, id, status) => {
  try {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status))
      return {
        success: false,
        status: 400,
        message: "Invalid status value",
        validStatuses,
      };

    const order = await Order.findById(id);
    if (!order)
      return { success: false, status: 404, message: "Order not found" };

    // Permission check for admin
    if (user.role === "admin") {
      const community = await Community.findOne({
        $or: [{ rootAdmin: user._id }, { admins: user._id }],
      });
      if (!community || !order.communityIds.includes(String(community._id))) {
        return {
          success: false,
          status: 403,
          message: "You do not have permission to update this order",
        };
      }
    }

    order.status = status;
    await order.save();

    // ✅ Order cache'lerini temizle
    await OrderCache.invalidateOrderCaches(user._id);
    console.log(`✅ Order caches invalidated for status update`);

    return {
      success: true,
      status: 200,
      message: "Order status updated successfully",
      order,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Failed to update order status",
      details: err.message,
    };
  }
};

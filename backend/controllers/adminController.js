const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total order count
    const totalOrders = await Order.countDocuments();
    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    // Total user count
    const totalUsers = await User.countDocuments();
    // Top selling products (only those that exist in the products collection)
    const topProductsAgg = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.product", totalSold: { $sum: "$products.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $match: { "productInfo.0": { $exists: true } } },
      { $unwind: "$productInfo" },
      { $project: { _id: 0, productId: "$productInfo._id", name: "$productInfo.name", totalSold: 1 } },
      { $limit: 5 }
    ]);
    // Send dashboard stats
    res.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      topProducts: topProductsAgg
    });
  } catch (err) {
    res.status(500).json({ error: 'Not get admin veriables', details: err.message });
  }
};
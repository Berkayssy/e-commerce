// services/searchService.js
const Product = require("../../models/Product");
const Community = require("../../models/Community");
const Plan = require("../../models/Plan");

exports.search = async (query, type) => {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        status: 400,
        message: "Search query is required",
      };
    }

    const searchQuery = query.trim().toLowerCase();
    const regex = { $regex: searchQuery, $options: "i" };

    const results = {
      products: [],
      communities: [],
      plans: [],
    };

    // Search products
    if (!type || type === "all" || type === "products") {
      results.products = await Product.find({
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { brand: regex },
        ],
      }).limit(20);
    }

    // Search communities
    if (!type || type === "all" || type === "communities") {
      results.communities = await Community.find({
        $or: [{ name: regex }, { description: regex }, { transId: regex }],
      }).limit(20);
    }

    // Search plans
    if (!type || type === "all" || type === "plans") {
      results.plans = await Plan.find({
        $or: [{ name: regex }, { description: regex }],
      }).limit(20);
    }

    return {
      success: true,
      status: 200,
      data: {
        query: searchQuery,
        results,
        totalResults:
          results.products.length +
          results.communities.length +
          results.plans.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Failed to execute search",
      details: err.message,
    };
  }
};

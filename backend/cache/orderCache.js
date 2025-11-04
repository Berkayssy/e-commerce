const redisClient = require("./redisClient");

const ANALYTICS_PREFIX = "analytics:";
const DASHBOARD_PREFIX = "dashboard:";
const ORDER_PREFIX = "order:";
const CACHE_EXPIRY = 1800; // 30 minutes

class OrderCache {
  // Order details cache
  static async getOrderById(orderId) {
    try {
      const cached = await redisClient.get(`${ORDER_PREFIX}${orderId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("❌ Order cache get error:", error);
      return null;
    }
  }

  static async setOrderById(orderId, orderData) {
    try {
      await redisClient.setex(
        `${ORDER_PREFIX}${orderId}`,
        CACHE_EXPIRY,
        JSON.stringify(orderData)
      );
    } catch (error) {
      console.error("❌ Order cache set error:", error);
    }
  }

  // Order analytics cache
  static async getSellerAnalytics(sellerId) {
    try {
      const cached = await redisClient.get(
        `${ANALYTICS_PREFIX}seller:${sellerId}`
      );
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("❌ Seller analytics cache get error:", error);
      return null;
    }
  }

  static async setSellerAnalytics(sellerId, analytics) {
    try {
      await redisClient.setex(
        `${ANALYTICS_PREFIX}seller:${sellerId}`,
        CACHE_EXPIRY,
        JSON.stringify(analytics)
      );
    } catch (error) {
      console.error("❌ Seller analytics cache set error:", error);
    }
  }

  // Dashboard cache
  static async getSellerDashboard(sellerId) {
    try {
      const cached = await redisClient.get(
        `${DASHBOARD_PREFIX}seller:${sellerId}`
      );
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("❌ Seller dashboard cache get error:", error);
      return null;
    }
  }

  static async setSellerDashboard(sellerId, dashboard) {
    try {
      await redisClient.setex(
        `${DASHBOARD_PREFIX}seller:${sellerId}`,
        CACHE_EXPIRY,
        JSON.stringify(dashboard)
      );
    } catch (error) {
      console.error("❌ Seller dashboard cache set error:", error);
    }
  }

  // Cache invalidation
  static async invalidateOrderCaches(sellerId = null) {
    try {
      if (sellerId) {
        await redisClient.del(`${ANALYTICS_PREFIX}seller:${sellerId}`);
        await redisClient.del(`${DASHBOARD_PREFIX}seller:${sellerId}`);
      }
      // Tüm order cache'lerini temizle
      const orderKeys = await redisClient.keys(`${ORDER_PREFIX}*`);
      const analyticsKeys = await redisClient.keys(`${ANALYTICS_PREFIX}*`);
      const dashboardKeys = await redisClient.keys(`${DASHBOARD_PREFIX}*`);
      const allKeys = [...orderKeys, ...analyticsKeys, ...dashboardKeys];

      if (allKeys.length > 0) {
        await Promise.all(allKeys.map((key) => redisClient.del(key)));
      }
    } catch (error) {
      console.error("❌ Order cache invalidation error:", error);
    }
  }
}

module.exports = OrderCache;

const redisClient = require("./redisClient");

const PRODUCT_CACHE_PREFIX = "product:";
const PRODUCT_LIST_PREFIX = "products:";
const CACHE_EXPIRY = 3600; // 1 saat

class ProductCache {
  static async getProductById(productId) {
    try {
      const cached = await redisClient.get(
        `${PRODUCT_CACHE_PREFIX}${productId}`
      );
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("❌ Product cache get error:", error);
      return null;
    }
  }

  static async setProductById(productId, productData) {
    try {
      await redisClient.setex(
        `${PRODUCT_CACHE_PREFIX}${productId}`,
        CACHE_EXPIRY,
        JSON.stringify(productData)
      );
    } catch (error) {
      console.error("❌ Product cache set error:", error);
    }
  }

  static async getProductList(key) {
    try {
      const cacheKey = `${PRODUCT_LIST_PREFIX}${key}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("❌ Product list cache get error:", error);
      return null;
    }
  }

  static async setProductList(key, products) {
    try {
      const cacheKey = `${PRODUCT_LIST_PREFIX}${key}`;
      await redisClient.setex(cacheKey, CACHE_EXPIRY, JSON.stringify(products));
    } catch (error) {
      console.error("❌ Product list cache set error:", error);
    }
  }

  static async invalidateProduct(productId) {
    try {
      await redisClient.del(`${PRODUCT_CACHE_PREFIX}${productId}`);
      const keys = await redisClient.keys(`${PRODUCT_LIST_PREFIX}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redisClient.del(key)));
      }
    } catch (error) {
      console.error("❌ Cache invalidation error:", error);
    }
  }
}

module.exports = ProductCache;

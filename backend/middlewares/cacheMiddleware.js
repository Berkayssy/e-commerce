const redis = require("../config/redis");
const logger = require("../utils/logger");

const cacheMiddleware =
  (keyBuilder, ttl = 60) =>
  async (req, res, next) => {
    if (!redis) return next();

    try {
      const key = `cache:${
        typeof keyBuilder === "function" ? keyBuilder(req) : keyBuilder
      }`;
      const cached = await redis.get(key);

      if (cached) {
        logger.info(`📦 Cache hit for ${key}`);
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // ✅ Conditional caching - sadece success responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(key, ttl, JSON.stringify(data));
        }
        originalJson(data);
      };

      next();
    } catch (err) {
      logger.error("Cache middleware error:", err);
      next();
    }
  };

module.exports = cacheMiddleware;

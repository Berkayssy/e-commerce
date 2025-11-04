const Redis = require("ioredis");
const logger = require("../utils/logger");

let redis;

if (process.env.NODE_ENV === "test") {
  redis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
  };
} else {
  // Use REDIS_URL if provided, otherwise use REDIS_HOST/REDIS_PORT
  // Default to localhost for local development, galeria-redis for Docker
  const redisUrl = process.env.REDIS_URL;
  const redisHost =
    process.env.REDIS_HOST ||
    (process.env.NODE_ENV === "production" ? "galeria-redis" : "localhost");
  const redisPort = process.env.REDIS_PORT || 6379;

  if (redisUrl) {
    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 1000,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: false, // Disable ready check for local development
      enableOfflineQueue: true, // Allow queueing commands when offline (for graceful degradation)
    });
  } else {
    redis = new Redis({
      host: redisHost,
      port: redisPort,
      retryDelayOnFailover: 1000,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: false, // Disable ready check for local development
      enableOfflineQueue: true, // Allow queueing commands when offline (for graceful degradation)
    });
  }

  redis.on("error", (err) => {
    // Only log error if not connection refused (Redis not running is OK in dev)
    if (
      !err.message.includes("ECONNREFUSED") &&
      !err.message.includes("ENOTFOUND")
    ) {
      logger.error("Redis Connection Error:", err);
    }
  });
  redis.on("connect", () =>
    logger.info(
      "✅ Redis Connected to " + (redisUrl || `${redisHost}:${redisPort}`)
    )
  );
}

module.exports = redis;

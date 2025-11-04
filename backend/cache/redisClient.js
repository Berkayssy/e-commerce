// backend/cache/redisClient.js - Production-ready Redis client for caching
const Redis = require("ioredis");
const logger = require("../utils/logger");

// Use REDIS_URL if provided, otherwise use REDIS_HOST/REDIS_PORT
// Default to localhost for local development, galeria-redis for Docker
const redisUrl = process.env.REDIS_URL;
const redisHost =
  process.env.REDIS_HOST ||
  (process.env.NODE_ENV === "production" ? "galeria-redis" : "localhost");
const redisPort = process.env.REDIS_PORT || 6379;

let redis;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    retryDelayOnFailover: 1000,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: false,
    enableOfflineQueue: true,
  });
} else {
  redis = new Redis({
    host: redisHost,
    port: redisPort,
    retryDelayOnFailover: 1000,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: false,
    enableOfflineQueue: true,
  });
}

redis.on("error", (err) => {
  // Only log non-connection errors (Redis not running is OK in dev)
  if (
    !err.message.includes("ECONNREFUSED") &&
    !err.message.includes("ENOTFOUND")
  ) {
    logger.error("Cache Redis Error:", err);
  }
});
redis.on("connect", () =>
  logger.info(
    "✅ Cache Redis Connected to " + (redisUrl || `${redisHost}:${redisPort}`)
  )
);

module.exports = redis;

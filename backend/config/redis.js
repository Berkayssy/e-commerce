// backend/config/redis.js - TAMAMEN DEĞİŞTİR:
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
  // DOCKER'DA KESİNLİKLE galeria-redis KULLAN
  const redisHost = process.env.REDIS_HOST || "galeria-redis";
  const redisPort = process.env.REDIS_PORT || 6379;

  redis = new Redis({
    host: redisHost,
    port: redisPort,
    retryDelayOnFailover: 1000,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on("error", (err) => logger.error("Redis Connection Error:", err));
  redis.on("connect", () => logger.info("✅ Redis Connected to " + redisHost));
}

module.exports = redis;

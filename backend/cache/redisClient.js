// backend/cache/redisClient.js - BU KODU YAPIŞTIR:
const Redis = require("ioredis");
const logger = require("../utils/logger");

// ✅ DOCKER'DA KESİNLİKLE galeria-redis KULLAN
const redisHost = "galeria-redis";
const redisPort = 6379;

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryDelayOnFailover: 1000,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => logger.error("Cache Redis Error:", err));
redis.on("connect", () =>
  logger.info("✅ Cache Redis Connected to " + redisHost)
);

module.exports = redis;

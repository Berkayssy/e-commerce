const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("../config/redis");
const logger = require("../utils/logger");

// Environment-based configuration
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// Track if Redis store initialization has been logged (to avoid duplicate logs)
let redisStoreLogged = false;
let memoryStoreLogged = false;

// Get rate limit configuration from environment
const getRateLimitConfig = (windowMs, max, options = {}) => {
  const baseConfig = {
    windowMs,
    max,
    message: {
      success: false,
      message:
        options.message ||
        "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    // Trust proxy for accurate IP addresses behind load balancer
    trustProxy: true,
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        limit: max,
        windowMs: windowMs,
      });

      res.status(429).json({
        success: false,
        message:
          options.message ||
          "Too many requests from this IP, please try again later.",
        retryAfter: Math.ceil(windowMs / 1000), // seconds
      });
    },
  };

  // Use Redis store in production if available
  if (!isTest && process.env.REDIS_URL) {
    try {
      baseConfig.store = new RedisStore({
        client: redis,
        prefix: "rl:", // Redis key prefix
      });
      // Only log once when Redis store is first initialized
      if (!redisStoreLogged) {
        logger.info("✅ Rate limiting using Redis store");
        redisStoreLogged = true;
      }
    } catch (err) {
      logger.warn(
        "⚠️ Redis store initialization failed, falling back to memory store",
        err.message
      );
      // Fallback to memory store
    }
  } else {
    // Only log once when memory store is first used
    if (!memoryStoreLogged) {
      logger.info(
        isTest
          ? "🧪 Rate limiting using memory store (test mode)"
          : "⚠️ Rate limiting using memory store (Redis not configured)"
      );
      memoryStoreLogged = true;
    }
  }

  return baseConfig;
};

// General API rate limiter
// Production: 100 requests per 15 minutes
// Development: 200 requests per 15 minutes
const generalLimiter = rateLimit(
  getRateLimitConfig(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes default
    parseInt(process.env.RATE_LIMIT_MAX || (isProduction ? "100" : "200")),
    {
      message: "Too many requests from this IP, please try again later.",
    }
  )
);

// Authentication endpoints rate limiter (stricter)
// Production: 5 attempts per 15 minutes
// Development: 10 attempts per 15 minutes
const authLimiter = rateLimit(
  getRateLimitConfig(
    parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    parseInt(process.env.AUTH_RATE_LIMIT_MAX || (isProduction ? "5" : "10")),
    {
      message: "Too many authentication attempts, please try again later.",
      skipSuccessfulRequests: true, // Don't count successful logins
      skipFailedRequests: false, // Count failed attempts
    }
  )
);

// Password reset rate limiter (very strict)
const passwordResetLimiter = rateLimit(
  getRateLimitConfig(
    parseInt(process.env.PASSWORD_RESET_WINDOW_MS || "3600000"), // 1 hour
    parseInt(process.env.PASSWORD_RESET_MAX || "3"), // 3 attempts per hour
    {
      message: "Too many password reset attempts, please try again later.",
    }
  )
);

// API key/registration rate limiter
const registrationLimiter = rateLimit(
  getRateLimitConfig(
    parseInt(process.env.REGISTRATION_WINDOW_MS || "3600000"), // 1 hour
    parseInt(process.env.REGISTRATION_MAX || "5"), // 5 registrations per hour per IP
    {
      message:
        "Too many registration attempts from this IP, please try again later.",
    }
  )
);

// Strict rate limiter for sensitive operations (payment, order creation)
const strictLimiter = rateLimit(
  getRateLimitConfig(
    parseInt(process.env.STRICT_RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
    parseInt(process.env.STRICT_RATE_LIMIT_MAX || "10"), // 10 requests per minute
    {
      message: "Too many requests for this operation, please slow down.",
    }
  )
);

// Admin endpoints rate limiter (more permissive but still limited)
const adminLimiter = rateLimit(
  getRateLimitConfig(
    parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
    parseInt(process.env.ADMIN_RATE_LIMIT_MAX || "30"), // 30 requests per minute
    {
      message: "Too many admin requests, please slow down.",
    }
  )
);

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  strictLimiter,
  adminLimiter,
};

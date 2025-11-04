const crypto = require("crypto");
const logger = require("../utils/logger");

const generateRequestId = () => {
  return crypto.randomUUID(); // Node.js built-in, no required UUID package
};

const requestIdMiddleware = (req, res, next) => {
  // Check for existing trace ID from upstream services (distributed tracing)
  const traceId =
    req.headers["x-trace-id"] ||
    req.headers["x-request-id"] ||
    req.headers["x-correlation-id"] ||
    generateRequestId();

  req.requestId = traceId;
  req.traceId = traceId;

  // Set response headers for downstream services
  res.setHeader("X-Request-ID", traceId);
  res.setHeader("X-Trace-ID", traceId);

  // Add to logger context (if using winston context feature)
  req.loggerContext = {
    requestId: traceId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };

  next();
};

const contextMiddleware = (req, res, next) => {
  req.context = {
    timestamp: new Date().toISOString(),
    userAgent: req.get("User-Agent") || "unknown",
    ip: req.ip,
    requestId: req.requestId || req.traceId,
    traceId: req.traceId,
    // Add user context if authenticated
    userId: req.user?.id || req.user?._id || null,
    // Add additional context from headers
    correlationId: req.headers["x-correlation-id"] || req.requestId,
  };

  // Log request with trace context
  logger.info("Incoming request", {
    ...req.loggerContext,
    ...req.context,
  });

  next();
};

// Middleware to log response with trace context
const responseTraceMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log response with trace context
    logger.info("Outgoing response", {
      requestId: req.requestId,
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: req.responseTime || "N/A",
    });

    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  requestIdMiddleware,
  contextMiddleware,
  responseTraceMiddleware,
};

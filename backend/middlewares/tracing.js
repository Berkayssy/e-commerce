// backend/middlewares/tracing.js - BU KODU YAPIŞTIR:
const crypto = require("crypto");

const generateRequestId = () => {
  return crypto.randomUUID(); // Node.js built-in, UUID gerektirmez
};

const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || generateRequestId();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};

const contextMiddleware = (req, res, next) => {
  req.context = {
    timestamp: new Date().toISOString(),
    userAgent: req.get("User-Agent") || "unknown",
  };
  next();
};

module.exports = { requestIdMiddleware, contextMiddleware };

const logger = require("../utils/logger");

// Production-ready global error handler
module.exports = (err, req, res, next) => {
  // Log error details
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate entry";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Prepare response
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.details || null,
    }),
  };

  res.status(statusCode).json(response);
};

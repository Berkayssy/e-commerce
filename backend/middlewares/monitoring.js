const healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[METRICS] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};

const timeoutMiddleware = (timeoutMs = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      console.log(
        `[TIMEOUT] Request timeout after ${timeoutMs}ms: ${req.method} ${req.originalUrl}`
      );
    });
    next();
  };
};

module.exports = { healthCheck, metricsMiddleware, timeoutMiddleware };

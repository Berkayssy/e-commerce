const logger = require("../utils/logger");
const http = require("http");

// Prometheus-style metrics storage
const metrics = {
  http_requests_total: { type: "counter", value: 0, labels: {} },
  http_request_duration_ms: {
    type: "histogram",
    buckets: [10, 50, 100, 200, 500, 1000, 2000],
    values: [],
  },
  http_requests_in_flight: { type: "gauge", value: 0 },
  http_errors_total: { type: "counter", value: 0, labels: {} },
};

// Increment request counter
const incrementRequestCounter = (method, path, statusCode) => {
  const label = `${method}_${path}_${statusCode}`;
  if (!metrics.http_requests_total.labels[label]) {
    metrics.http_requests_total.labels[label] = 0;
  }
  metrics.http_requests_total.labels[label]++;
  metrics.http_requests_total.value++;
};

// Record request duration
const recordRequestDuration = (duration) => {
  metrics.http_request_duration_ms.values.push(duration);
  // Keep only last 1000 values to prevent memory leak
  if (metrics.http_request_duration_ms.values.length > 1000) {
    metrics.http_request_duration_ms.values.shift();
  }
};

// Increment error counter
const incrementErrorCounter = (method, path, statusCode) => {
  if (statusCode >= 400) {
    const label = `${method}_${path}_${statusCode}`;
    if (!metrics.http_errors_total.labels[label]) {
      metrics.http_errors_total.labels[label] = 0;
    }
    metrics.http_errors_total.labels[label]++;
    metrics.http_errors_total.value++;
  }
};

// Format Prometheus metrics output
const formatPrometheusMetrics = () => {
  let output = "# HELP http_requests_total Total number of HTTP requests\n";
  output += "# TYPE http_requests_total counter\n";
  Object.entries(metrics.http_requests_total.labels).forEach(
    ([label, count]) => {
      const [method, path, status] = label.split("_");
      output += `http_requests_total{method="${method}",path="${path}",status="${status}"} ${count}\n`;
    }
  );
  output += `http_requests_total ${metrics.http_requests_total.value}\n\n`;

  output +=
    "# HELP http_request_duration_ms HTTP request duration in milliseconds\n";
  output += "# TYPE http_request_duration_ms histogram\n";
  if (metrics.http_request_duration_ms.values.length > 0) {
    const sorted = [...metrics.http_request_duration_ms.values].sort(
      (a, b) => a - b
    );
    const buckets = metrics.http_request_duration_ms.buckets;
    buckets.forEach((bucket) => {
      const count = sorted.filter((v) => v <= bucket).length;
      output += `http_request_duration_ms_bucket{le="${bucket}"} ${count}\n`;
    });
    output += `http_request_duration_ms_bucket{le="+Inf"} ${sorted.length}\n`;
    const sum = sorted.reduce((a, b) => a + b, 0);
    output += `http_request_duration_ms_sum ${sum}\n`;
    output += `http_request_duration_ms_count ${sorted.length}\n\n`;
  }

  output += "# HELP http_errors_total Total number of HTTP errors\n";
  output += "# TYPE http_errors_total counter\n";
  Object.entries(metrics.http_errors_total.labels).forEach(([label, count]) => {
    const [method, path, status] = label.split("_");
    output += `http_errors_total{method="${method}",path="${path}",status="${status}"} ${count}\n`;
  });
  output += `http_errors_total ${metrics.http_errors_total.value}\n\n`;

  output +=
    "# HELP http_requests_in_flight Current number of HTTP requests being processed\n";
  output += "# TYPE http_requests_in_flight gauge\n";
  output += `http_requests_in_flight ${metrics.http_requests_in_flight.value}\n\n`;

  output += "# HELP process_uptime_seconds Process uptime in seconds\n";
  output += "# TYPE process_uptime_seconds counter\n";
  output += `process_uptime_seconds ${Math.floor(process.uptime())}\n\n`;

  output += "# HELP nodejs_heap_used_bytes Node.js heap memory used in bytes\n";
  output += "# TYPE nodejs_heap_used_bytes gauge\n";
  output += `nodejs_heap_used_bytes ${process.memoryUsage().heapUsed}\n\n`;

  return output;
};

const healthCheck = async (req, res) => {
  const mongoose = require("mongoose");
  const redis = require("../config/redis");

  const checks = {
    server: "healthy",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: "unknown",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  // Check Redis connection
  try {
    if (process.env.NODE_ENV !== "test") {
      await redis.ping();
      checks.redis = "connected";
    } else {
      checks.redis = "skipped (test mode)";
    }
  } catch (err) {
    checks.redis = "disconnected";
  }

  const isHealthy =
    checks.database === "connected" && checks.redis !== "disconnected";

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? "Server is healthy" : "Server has issues",
    checks,
  });
};

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  metrics.http_requests_in_flight.value++;

  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.http_requests_in_flight.value--;

    const method = req.method;
    const path = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;

    incrementRequestCounter(method, path, statusCode);
    recordRequestDuration(duration);
    incrementErrorCounter(method, path, statusCode);

    // Use logger instead of console.log
    logger.info(
      `[METRICS] ${method} ${req.originalUrl} ${statusCode} - ${duration}ms`,
      {
        method,
        path,
        statusCode,
        duration,
        requestId: req.requestId,
      }
    );
  });

  next();
};

const getMetrics = (req, res) => {
  res.set("Content-Type", "text/plain; version=0.0.4");
  res.send(formatPrometheusMetrics());
};

const timeoutMiddleware = (timeoutMs = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      logger.warn(
        `[TIMEOUT] Request timeout after ${timeoutMs}ms: ${req.method} ${req.originalUrl}`,
        {
          method: req.method,
          url: req.originalUrl,
          requestId: req.requestId,
          timeout: timeoutMs,
        }
      );
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: "Request timeout",
          timeout: timeoutMs,
        });
      }
    });
    next();
  };
};

module.exports = {
  healthCheck,
  metricsMiddleware,
  timeoutMiddleware,
  getMetrics,
};

const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger");
const applySecurity = require("./config/security");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const requestLogger = require("./middlewares/requestLogger");
const { generalLimiter, authLimiter } = require("./middlewares/rateLimiting");
const sanitizeInput = require("./middlewares/sanitizeInput");
const securityHeaders = require("./middlewares/securityHeaders");
const {
  healthCheck,
  metricsMiddleware,
  timeoutMiddleware,
  getMetrics,
} = require("./middlewares/monitoring");
const {
  requestIdMiddleware,
  contextMiddleware,
} = require("./middlewares/tracing");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// routes
const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/product/product.routes");
const orderRoutes = require("./modules/order/orders.routes");
const planRoutes = require("./modules/plan/plan.routes");
const sellerRoutes = require("./modules/seller/seller.routes");
const favoriteRoutes = require("./modules/favorites/favorites.route");
// const communityRoutes = require("./modules/community/community.routes");
const searchRoutes = require("./modules/search/search.routes");
const onboardingRoutes = require("./modules/seller/onboarding/onboarding.routes");

const app = express();

const cors = require("cors");
const config = require("./config/env");

// CORS configuration - environment-based
const corsOptions = {
  origin: (origin, callback) => {
    // Get allowed origins from environment or use defaults
    const allowedOrigins = config.CORS_ORIGINS || [
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV === "development") {
        logger.warn(`CORS: Allowing origin ${origin} in development mode`);
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Request-ID",
    "X-Trace-ID",
    "X-Correlation-ID",
  ],
  exposedHeaders: ["X-Request-ID", "X-Trace-ID"],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Body parsing middleware - environment-based limits
const jsonLimit =
  process.env.JSON_BODY_LIMIT ||
  (process.env.NODE_ENV === "production" ? "1mb" : "10mb");
const urlencodedLimit =
  process.env.URLENCODED_BODY_LIMIT ||
  (process.env.NODE_ENV === "production" ? "1mb" : "10mb");

app.use(
  express.json({
    limit: jsonLimit,
    strict: true, // Only parse arrays and objects
    type: "application/json",
  })
);
app.use(
  express.urlencoded({
    extended: true, // Use qs library for parsing
    limit: urlencodedLimit,
    parameterLimit: 1000, // Limit number of parameters
  })
);

logger.info(
  `📦 Body parsing limits: JSON=${jsonLimit}, URLEncoded=${urlencodedLimit}`
);

// Tracing and Monitoring
app.use(requestIdMiddleware);
app.use(contextMiddleware);
app.use(metricsMiddleware);
app.use(timeoutMiddleware(30000));

// Security headers
app.use(securityHeaders);

// Rate limiting
app.use(generalLimiter);
app.use("/api/auth", authLimiter);

// Input sanitization middleware
app.use(sanitizeInput);

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Progon E-Commerce API Docs",
  })
);

// 🔒 Security Middleware
applySecurity(app);

// 🧩 Request logger
app.use(requestLogger);

// Health check endpoint
app.get("/health", healthCheck);
// Prometheus metrics endpoint (should not be rate-limited)
app.get("/metrics", getMetrics);

// 🧠 Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
//app.use("/api/communities", communityRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/search", searchRoutes);

// Seller onboarding routes
app.use("/api/seller/onboarding", onboardingRoutes);

// ❤️ Favorites routes
app.use("/api/favorites", favoriteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// 🧨 Global error handler
app.use(globalErrorHandler);

module.exports = app;

// Production-ready backend application with enhanced security, error handling, and monitoring
const express = require("express");
const morgan = require("morgan");
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
const communityRoutes = require("./modules/community/community.routes");
const searchRoutes = require("./modules/search/search.routes");
const onboardingRoutes = require("./modules/seller/onboarding/onboarding.routes");

const app = express();

// 🔴 CRITICAL: CORS'u EN BAŞTA
const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.get("/metrics", metricsMiddleware);

// 🧠 Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/communities", communityRoutes);
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

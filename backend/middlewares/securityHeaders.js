const helmet = require("helmet");
const logger = require("../utils/logger");

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// CSP configuration based on environment
const getCSPDirectives = () => {
  const baseDirectives = {
    defaultSrc: ["'self'"],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Needed for Swagger UI and some libraries
      "https://fonts.googleapis.com",
    ],
    scriptSrc: [
      "'self'",
      ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"]), // Allow for Swagger UI in dev
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://fonts.googleapis.com",
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "blob:", // For file uploads
    ],
    connectSrc: [
      "'self'",
      frontendUrl,
      ...(isProduction ? [] : ["http://localhost:*"]), // Allow localhost in development
    ],
    mediaSrc: ["'self'", "https:"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: isProduction ? [] : null, // Only in production
  };

  // Remove null values
  Object.keys(baseDirectives).forEach((key) => {
    if (baseDirectives[key] === null) {
      delete baseDirectives[key];
    }
  });

  return baseDirectives;
};

// Security headers configuration
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: getCSPDirectives(),
    reportOnly: false, // Set to true if you want to test CSP without blocking
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: isProduction,

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: isProduction ? "same-origin" : "cross-origin",
  },

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: isProduction ? "same-origin" : "unsafe-none",
  },

  // DNS Prefetch Control
  dnsPrefetchControl: true,

  // Expect-CT (Certificate Transparency)
  expectCt: isProduction
    ? {
        maxAge: 86400,
        enforce: true,
      }
    : false,

  // Frameguard (X-Frame-Options)
  frameguard: {
    action: "deny",
  },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: isProduction
    ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // IE No Open
  ieNoOpen: true,

  // No Sniff (X-Content-Type-Options)
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permissions Policy (formerly Feature-Policy)
  permissionsPolicy: {
    features: {
      accelerometer: ["'none'"],
      ambientLightSensor: ["'none'"],
      autoplay: ["'none'"],
      battery: ["'none'"],
      camera: ["'none'"],
      displayCapture: ["'none'"],
      documentDomain: ["'none'"],
      encryptedMedia: ["'none'"],
      executionWhileNotRendered: ["'none'"],
      executionWhileOutOfViewport: ["'none'"],
      fullscreen: ["'self'"],
      geolocation: ["'none'"],
      gyroscope: ["'none'"],
      keyboardMap: ["'none'"],
      magnetometer: ["'none'"],
      microphone: ["'none'"],
      midi: ["'none'"],
      navigationOverride: ["'none'"],
      payment: ["'none'"],
      pictureInPicture: ["'none'"],
      publickeyCredentials: ["'self'"],
      screenWakeLock: ["'none'"],
      syncXhr: ["'none'"],
      usb: ["'none'"],
      webShare: ["'none'"],
      xrSpatialTracking: ["'none'"],
    },
  },

  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },

  // XSS Protection (legacy, but still useful)
  xssFilter: true,
});

// Custom security headers middleware
const customSecurityHeaders = (req, res, next) => {
  // X-Request-ID header (for tracing)
  if (req.requestId) {
    res.setHeader("X-Request-ID", req.requestId);
  }

  // X-Content-Type-Options
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-DNS-Prefetch-Control
  res.setHeader("X-DNS-Prefetch-Control", "on");

  // X-Download-Options (IE8+)
  res.setHeader("X-Download-Options", "noopen");

  // X-Frame-Options (additional security)
  res.setHeader("X-Frame-Options", "DENY");

  // X-Permitted-Cross-Domain-Policies
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // X-XSS-Protection (legacy browsers)
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict-Transport-Security (HSTS) - only if HTTPS
  if (isProduction && req.secure) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
};

// Combined security headers middleware
const applySecurityHeaders = (req, res, next) => {
  try {
    securityHeaders(req, res, () => {
      customSecurityHeaders(req, res, next);
    });
  } catch (err) {
    logger.error("Security headers error:", err);
    // Don't block the request if security headers fail
    next();
  }
};

if (!isProduction) {
  logger.info(
    "🛡️ Security headers configured for development mode (relaxed CSP)"
  );
} else {
  logger.info(
    "🛡️ Security headers configured for production mode (strict CSP)"
  );
}

module.exports = applySecurityHeaders;

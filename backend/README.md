# �� Galeria E-Commerce Backend

**Enterprise-grade Node.js backend for modern e-commerce platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Security](#-security)
- [Monitoring & Observability](#-monitoring--observability)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [Contributing](#-contributing)

---

## 🎯 Overview

Galeria Backend is a production-ready, enterprise-grade Node.js application built with Express.js, featuring multi-vendor support, real-time inventory management, secure payment processing, and comprehensive monitoring capabilities.

### Key Highlights

- ✅ **Production-Ready**: Enterprise-level security, monitoring, and error handling
- ✅ **Scalable Architecture**: Microservice-ready monolith with clean separation of concerns
- ✅ **Comprehensive Security**: Multi-layer security stack with rate limiting, input validation, and XSS protection
- ✅ **Observability**: Prometheus metrics, distributed tracing, and structured logging
- ✅ **High Performance**: Redis caching, connection pooling, and optimized queries
- ✅ **Developer Experience**: Comprehensive API documentation, health checks, and clear error messages

---

## 🛠 Tech Stack

### Core Technologies

- **Runtime**: Node.js 18+ (ES2022)
- **Framework**: Express.js 4.18+
- **Database**: MongoDB 7.0+ with Mongoose 8.15+
- **Cache**: Redis with ioredis
- **Authentication**: JWT + Passport.js (Google OAuth)
- **File Storage**: Cloudinary

### Key Libraries

- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize
- **Logging**: Winston
- **Monitoring**: Custom Prometheus-compatible metrics
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest

---

## 🏗 Architecture

### Directory Structure

```
backend/
├── 📁 config/              # Configuration files
│   ├── db.js              # MongoDB connection with retry logic
│   ├── redis.js           # Redis client configuration
│   ├── env.js             # Environment variable validation (Joi)
│   ├── passport.js        # Passport.js strategies
│   ├── security.js        # Security middleware
│   └── swagger.js         # Swagger/OpenAPI configuration
│
├── 📁 middlewares/        # Custom middleware stack
│   ├── authMiddleware.js  # JWT authentication
│   ├── rateLimiting.js    # Redis-based rate limiting
│   ├── securityHeaders.js # Helmet + custom security headers
│   ├── sanitizeInput.js   # XSS protection
│   ├── monitoring.js      # Prometheus metrics & health checks
│   ├── tracing.js         # Distributed tracing
│   ├── globalErrorHandler.js # Centralized error handling
│   └── ...
│
├── 📁 modules/            # Feature modules (MVC pattern)
│   ├── auth/             # Authentication module
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   └── auth.validator.js
│   ├── product/          # Product management
│   ├── order/            # Order processing
│   ├── seller/           # Seller features
│   ├── plan/             # Subscription plans
│   ├── community/        # Community features
│   ├── favorites/        # Favorites system
│   └── search/           # Search functionality
│
├── 📁 models/            # MongoDB schemas (Mongoose)
├── 📁 cache/             # Redis caching layer
├── 📁 utils/             # Helper functions
├── 📁 tests/             # Test suites
├── 📁 docs/              # API documentation (Swagger)
├── 📁 logs/              # Application logs
│
├── app.js                # Express application setup
├── server.js             # Server entry point
└── package.json
```

### Design Patterns

- **MVC Architecture**: Routes → Controllers → Services → Models
- **Middleware Chain**: Security → Tracing → Monitoring → Validation → Routes
- **Dependency Injection**: Modular service layer
- **Factory Pattern**: Rate limiters, validators
- **Strategy Pattern**: Authentication strategies

---

## ✨ Features

### Core E-Commerce Features

- **Multi-Vendor Support**: Seller onboarding, store management, commission tracking
- **Product Management**: CRUD operations, inventory tracking, bulk operations
- **Order Processing**: Order lifecycle, payment integration, fulfillment tracking
- **Shopping Cart**: Persistent cart, favorites, wishlists
- **Search & Filtering**: Advanced search with filtering and pagination
- **Community Features**: Reviews, ratings, discussions

### Security Features

- **Multi-Layer Security**:

  - Helmet.js for HTTP security headers
  - Environment-based CSP (Content Security Policy)
  - Rate limiting (Redis-based with memory fallback)
  - Input sanitization (XSS protection)
  - CORS with environment-based origins
  - JWT authentication with refresh tokens

- **Data Protection**:
  - Password hashing (bcryptjs, 12 rounds)
  - JWT token expiration and refresh
  - Environment variable encryption
  - Request validation (Joi schemas)
  - MongoDB injection protection

### Performance Features

- **Caching**:

  - Redis caching layer for products, orders, and queries
  - Cache invalidation strategies
  - TTL-based expiration

- **Database Optimization**:

  - Connection pooling (max: 10, min: 2)
  - Query optimization with lean operations
  - Indexed fields for fast lookups
  - Aggregation pipelines for analytics

- **Request Optimization**:
  - Body size limits (configurable per environment)
  - Request timeouts (30s default)
  - Compression support
  - Pagination for large datasets

### Monitoring & Observability

- **Prometheus Metrics**:

  - HTTP request counters (by method, path, status)
  - Request duration histograms
  - Error rate tracking
  - In-flight request gauge
  - System metrics (uptime, memory)

- **Distributed Tracing**:

  - Request ID generation
  - Trace ID propagation (via headers)
  - Correlation IDs for request tracking
  - Context-aware logging

- **Structured Logging**:

  - Winston logger with multiple transports
  - Error logging with stack traces
  - Request/response logging
  - Log rotation and retention

- **Health Checks**:
  - `/health` endpoint with dependency status
  - MongoDB connection status
  - Redis connection status
  - Server uptime and memory

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB 7.0+ (local or cloud)
- Redis (optional, falls back to memory store)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd e-commerce/backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=4000

# Database
MONGO_URI=mongodb://localhost:27017/galeria
# or MONGODB_URI=mongodb://localhost:27017/galeria

# Redis (optional)
REDIS_URL=redis://localhost:6379
# or
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Body Limits (optional)
JSON_BODY_LIMIT=10mb
URLENCODED_BODY_LIMIT=10mb

# Database (optional)
FAIL_FAST_DB=true

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Running the Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Validate environment variables
npm run validate-env
```

### Health Check

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is healthy",
  "checks": {
    "server": "healthy",
    "database": "connected",
    "redis": "connected",
    "timestamp": "2025-11-04T20:30:00.000Z",
    "uptime": 3600.5,
    "environment": "development"
  }
}
```

---

## 🔒 Security

### Security Middleware Stack

The middleware stack is ordered for optimal security:

1. **CORS**: Cross-origin request handling
2. **Body Parsing**: JSON/URL-encoded with size limits
3. **Tracing**: Request ID and trace ID generation
4. **Monitoring**: Metrics collection
5. **Timeout**: Request timeout protection (30s)
6. **Security Headers**: Helmet + custom headers
7. **Rate Limiting**: General + auth-specific limits
8. **Input Sanitization**: XSS protection
9. **Request Logging**: Structured logging
10. **Routes**: API endpoints
11. **Error Handling**: Global error handler

### Rate Limiting

Multiple rate limiters for different use cases:

- **General API**: 100 req/15min (dev: 200)
- **Authentication**: 5 req/15min (dev: 10)
- **Password Reset**: 3 req/hour
- **Registration**: 5 req/hour
- **Admin**: 1000 req/15min
- **Strict**: 10 req/15min

All limits are configurable via environment variables and use Redis when available, with automatic fallback to memory store.

### Security Headers

- **CSP**: Content Security Policy (environment-based)
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection
- **Referrer-Policy**: Referrer information control
- **Permissions-Policy**: Feature permissions

---

## 📊 Monitoring & Observability

### Prometheus Metrics

Metrics are exposed at `/metrics` endpoint in Prometheus format:

```bash
curl http://localhost:4000/metrics
```

Available metrics:

- `http_requests_total`: Total HTTP requests (counter)
- `http_request_duration_ms`: Request duration (histogram)
- `http_errors_total`: Total HTTP errors (counter)
- `http_requests_in_flight`: Current in-flight requests (gauge)
- `process_uptime_seconds`: Server uptime (gauge)
- `nodejs_heap_used_bytes`: Memory usage (gauge)

### Distributed Tracing

Every request receives:

- **Request ID**: Unique identifier for the request
- **Trace ID**: For distributed tracing across services
- **Correlation ID**: For tracking related requests

Trace IDs are propagated via headers:

- `X-Request-ID`: Request identifier
- `X-Trace-ID`: Trace identifier
- `X-Correlation-ID`: Correlation identifier

### Logging

Structured logging with Winston:

```javascript
// Log files
logs/combined.log  # All logs
logs/error.log     # Error logs only
```

Log levels: `error`, `warn`, `info`, `debug`

### Health Checks

- **Endpoint**: `GET /health`
- **Response**: JSON with server, database, and Redis status
- **Use case**: Load balancer health checks, monitoring tools

---

## 📚 API Documentation

### Swagger UI

Interactive API documentation available at:

```
http://localhost:4000/api-docs
```

### API Endpoints

#### Authentication

```
POST   /api/auth/register       # User registration
POST   /api/auth/login          # User login
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/logout         # User logout
GET    /api/auth/me             # Get current user
```

#### Products

```
GET    /api/products            # List products (paginated)
GET    /api/products/:id        # Get product details
POST   /api/products            # Create product (seller)
PUT    /api/products/:id        # Update product (seller)
DELETE /api/products/:id        # Delete product (seller)
```

#### Orders

```
POST   /api/orders              # Create order
GET    /api/orders/my           # Get user orders
GET    /api/orders/:id          # Get order details
PUT    /api/orders/:id/cancel   # Cancel order
```

#### Other Endpoints

```
GET    /api/communities         # Community features
GET    /api/plans               # Subscription plans
GET    /api/sellers             # Seller management
GET    /api/search              # Search functionality
GET    /api/favorites           # Favorites management
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "status": 200
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...],
  "status": 400
}
```

---

## 🧪 Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── setupTest.js    # Test setup configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/auth.test.js
```

### Test Coverage

Target: **85%+ coverage**

Coverage reports available at: `coverage/lcov-report/index.html`

---

## 🐳 Deployment

### Docker

```bash
# Build image
docker build -t galeria-backend .

# Run container
docker run -p 4000:4000 --env-file .env galeria-backend
```

### Docker Compose

```bash
# Start all services (MongoDB, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f galeria-backend

# Stop services
docker-compose down
```

### Production Deployment

See `PRODUCTION.md` for detailed production deployment guide.

Key considerations:

- Environment variables configuration
- Database connection string
- Redis availability
- SSL/TLS certificates
- Load balancer configuration
- Monitoring setup (Prometheus, Grafana)

---

## ⚙️ Configuration

### Environment-Based Configuration

The application adapts to different environments:

**Development:**

- Relaxed CORS policies
- Detailed error messages with stack traces
- Higher body limits (10MB)
- Memory-based rate limiting fallback

**Production:**

- Strict CORS policies
- Minimal error details
- Lower body limits (1MB)
- Redis-based rate limiting required
- Fail-fast database connection

### Configuration Files

- **`config/env.js`**: Environment variable validation (Joi)
- **`config/db.js`**: MongoDB connection with retry logic
- **`config/redis.js`**: Redis client configuration
- **`config/security.js`**: Security middleware
- **`config/swagger.js`**: API documentation

---

## 📖 Additional Documentation

- **`BACKEND_STATUS_REPORT.md`**: Current backend status and analysis
- **`IMPLEMENTATION_GUIDE.md`**: Detailed implementation explanations
- **`PRODUCTION.md`**: Production deployment guide
- **`env.example`**: Environment variables template

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- ESLint configuration included
- Pre-commit hooks (Husky) for linting
- Pre-push hooks for tests
- Follow existing code patterns

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

- **API Documentation**: http://localhost:4000/api-docs
- **Health Check**: http://localhost:4000/health
- **Metrics**: http://localhost:4000/metrics
- **Logs**: `logs/combined.log` and `logs/error.log`

---

## 🎯 Production Readiness Checklist

✅ Environment variable validation  
✅ Security headers (Helmet)  
✅ Rate limiting (Redis + fallback)  
✅ Input sanitization  
✅ CORS configuration  
✅ Error handling  
✅ Logging (Winston)  
✅ Health checks  
✅ Metrics (Prometheus)  
✅ Distributed tracing  
✅ Database connection pooling  
✅ Graceful shutdown  
✅ API documentation (Swagger)  
✅ CI/CD pipeline configuration  
✅ Docker support

---

**Built with ❤️ using Node.js and Express.js**

_Last updated: November 2025_

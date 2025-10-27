# Galeria Backend - Production Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Redis 6+
- PM2 (for process management)

## Environment Setup

1. **Copy environment template:**

   ```bash
   cp env.example .env
   ```

2. **Configure environment variables:**

   ```bash
   # Required variables
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/galeria_production
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   JWT_EXPIRES=1d
   REDIS_URL=redis://localhost:6379
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Validate environment:**
   ```bash
   npm run validate-env
   ```

## Installation & Setup

1. **Install dependencies:**

   ```bash
   npm ci --only=production
   ```

2. **Run tests:**

   ```bash
   npm test
   ```

3. **Start production server:**
   ```bash
   npm run prod
   ```

## PM2 Process Management

1. **Install PM2:**

   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file:**

   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [
       {
         name: "galeria-backend",
         script: "server.js",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           PORT: 5000,
         },
         error_file: "./logs/err.log",
         out_file: "./logs/out.log",
         log_file: "./logs/combined.log",
         time: true,
       },
     ],
   };
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Security Checklist

- ✅ Helmet security headers enabled
- ✅ CORS properly configured
- ✅ Rate limiting implemented
- ✅ Input validation with Joi
- ✅ JWT secrets are secure (32+ characters)
- ✅ Environment variables validated
- ✅ Error handling doesn't leak sensitive info
- ✅ Database connection secured
- ✅ Logging configured

## Monitoring & Health Checks

- **Health endpoint:** `GET /health`
- **Logs location:** `./logs/`
- **PM2 monitoring:** `pm2 monit`

## Database Migration

1. **Backup existing data:**

   ```bash
   mongodump --db galeria_development --out backup/
   ```

2. **Restore to production:**
   ```bash
   mongorestore --db galeria_production backup/galeria_development/
   ```

## Performance Optimization

- Connection pooling configured
- Request body size limits set
- Graceful shutdown handling
- Cluster mode with PM2
- Redis caching enabled

## Troubleshooting

### Common Issues:

1. **Environment validation fails:**

   - Check all required variables are set
   - Ensure JWT_SECRET is 32+ characters

2. **Database connection fails:**

   - Verify MONGO_URI is correct
   - Check MongoDB is running
   - Ensure network connectivity

3. **CORS errors:**
   - Update FRONTEND_URL in .env
   - Check CORS configuration in security.js

### Logs:

- Application logs: `./logs/combined.log`
- Error logs: `./logs/error.log`
- PM2 logs: `pm2 logs galeria-backend`

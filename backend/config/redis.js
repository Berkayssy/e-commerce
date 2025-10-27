const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

if (process.env.NODE_ENV === 'test') {
  redis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
  };
} else {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(redisUrl);
  redis.on('error', (err) => logger.error('Redis Error:', err));
}

module.exports = redis;
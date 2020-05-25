
const Redis = require('ioredis');

const { REDIS_CONFIG } = require('../config/redis');

const RedisSubInstance = new Redis(REDIS_CONFIG);
const RedisPubInstance = new Redis(REDIS_CONFIG);
const RedisDbInstance = new Redis(REDIS_CONFIG);

module.exports = {
  RedisSubInstance,
  RedisPubInstance,
  RedisDbInstance,
};

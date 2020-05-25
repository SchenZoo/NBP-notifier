const {
  REDIS_HOST, REDIS_PORT = 6379, REDIS_PASSWORD, REDIS_DB = 0,
} = process.env;

if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
  console.error('Redis environment variables missing');
  process.exit(1);
}

const REDIS_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_DB,
  password: REDIS_PASSWORD,
};


module.exports = {
  REDIS_CONFIG,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DB,
};

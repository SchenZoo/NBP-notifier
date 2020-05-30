const { RedisDbInstance } = require('../redis');

const REDIS_KEYS = {
  PENDING_EMAILS: 'pending-emails',
  PENDING_POINTER: 'pending-pointer',
  TOP_POINTER: 'top-pointer',
};
RedisDbInstance.flushdb();
async function getQueuedEmail() {
  let pointer = await RedisDbInstance.get(REDIS_KEYS.PENDING_POINTER);
  if (!pointer) {
    await RedisDbInstance.set(REDIS_KEYS.PENDING_POINTER, 1);
    pointer = 1;
  }
  const pendingEmail = await RedisDbInstance.hget(REDIS_KEYS.PENDING_EMAILS, pointer);
  if (pendingEmail) {
    await RedisDbInstance.pipeline()
      .hdel(REDIS_KEYS.PENDING_EMAILS, pointer)
      .incr(REDIS_KEYS.PENDING_POINTER)
      .exec();
    return JSON.parse(pendingEmail);
  }
  return null;
}

async function addQueuedEmail(emailData) {
  const pointer = await RedisDbInstance.incr(REDIS_KEYS.TOP_POINTER);
  await RedisDbInstance.hset(REDIS_KEYS.PENDING_EMAILS, pointer, JSON.stringify(emailData));
}

module.exports = {
  getQueuedEmail,
  addQueuedEmail,
};

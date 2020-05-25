const { RedisDbInstance } = require('../redis');

const REDIS_KEYS = {
  EMAIL_SENT: 'emails-sent',
  EMAIL_FAILED: 'emails-failed',
  EMAIL_PENDING: 'emails-pending',
};

async function addEmailSent() {
  return RedisDbInstance
    .pipeline()
    .incr(REDIS_KEYS.EMAIL_SENT)
    .decr(REDIS_KEYS.EMAIL_PENDING)
    .exec();
}


async function addEmailFailed() {
  return RedisDbInstance
    .pipeline()
    .incr(REDIS_KEYS.EMAIL_FAILED)
    .decr(REDIS_KEYS.EMAIL_PENDING)
    .exec();
}


async function addEmailPending() {
  return RedisDbInstance
    .incr(REDIS_KEYS.EMAIL_PENDING);
}

async function getStatistics() {
  return RedisDbInstance
    .pipeline()
    .get(REDIS_KEYS.EMAIL_SENT)
    .get(REDIS_KEYS.EMAIL_FAILED)
    .get(REDIS_KEYS.EMAIL_PENDING)
    .exec()
    .then((pipeData) => {
      const [[, emailsSent], [, emailsFailed], [, emailsPending]] = pipeData;
      return {
        emailsPending,
        emailsSent,
        emailsFailed,
      };
    });
}

module.exports = {
  addEmailSent,
  addEmailFailed,
  addEmailPending,
  getStatistics,
};

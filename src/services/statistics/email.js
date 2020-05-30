const { RedisDbInstance } = require('../redis');

const REDIS_KEYS = {
  EMAIL_SENT: 'emails-sent',
  EMAIL_FAILED: 'emails-failed',
  EMAIL_PENDING: 'emails-pending',
  EMAIL_QUEUED: 'emails-queued',
};

async function addEmailSentCount() {
  return RedisDbInstance.pipeline()
    .incr(REDIS_KEYS.EMAIL_SENT)
    .decr(REDIS_KEYS.EMAIL_PENDING)
    .exec()
    .then((res) => res[0][1]);
}

async function addEmailFailedCount() {
  return RedisDbInstance.pipeline()
    .incr(REDIS_KEYS.EMAIL_FAILED)
    .decr(REDIS_KEYS.EMAIL_PENDING)
    .exec()
    .then((res) => res[0][1]);
}

async function addEmailPendingCount() {
  return RedisDbInstance.incr(REDIS_KEYS.EMAIL_PENDING);
}

async function getEmailPendingCount() {
  return RedisDbInstance.get(REDIS_KEYS.EMAIL_PENDING);
}

async function addEmailQueueCount() {
  return RedisDbInstance.pipeline()
    .incr(REDIS_KEYS.EMAIL_QUEUED)
    .decr(REDIS_KEYS.EMAIL_PENDING)
    .exec()
    .then((res) => res[0][1]);
}

async function removeEmailQueueCount() {
  return RedisDbInstance.decr(REDIS_KEYS.EMAIL_QUEUED);
}

async function getStatistics() {
  return RedisDbInstance.pipeline()
    .get(REDIS_KEYS.EMAIL_SENT)
    .get(REDIS_KEYS.EMAIL_FAILED)
    .get(REDIS_KEYS.EMAIL_PENDING)
    .get(REDIS_KEYS.EMAIL_QUEUED)
    .exec()
    .then((pipeData) => {
      const [[, emailsSent], [, emailsFailed], [, emailsPending], [, emailsQueued]] = pipeData;
      return {
        emailsPending,
        emailsSent,
        emailsFailed,
        emailsQueued,
      };
    });
}

module.exports = {
  addEmailSentCount,
  addEmailFailedCount,
  addEmailPendingCount,
  getEmailPendingCount,
  addEmailQueueCount,
  removeEmailQueueCount,
  getStatistics,
};

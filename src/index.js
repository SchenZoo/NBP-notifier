const { safeJsonParse } = require('./common/safe_parse');

const { RedisSubInstance, RedisPubInstance } = require('./services/redis');
const { sendEmail } = require('./services/senders/email_sender');
const { getStatistics } = require('./services/statistics/email');

const CHANNELS = {
  EMAIL_REQUEST: 'email-request',
  GET_STATS: 'get-statistics',
};

RedisSubInstance.on('message', async (channel, jsonData) => {
  const { id, data } = safeJsonParse(jsonData);
  switch (channel) {
    case CHANNELS.EMAIL_REQUEST: {
      const emailSent = await sendEmail(data);
      RedisPubInstance.publish(`${channel}-${id}`, emailSent);
      break;
    }

    case CHANNELS.GET_STATS: {
      const statistics = await getStatistics();
      RedisPubInstance.publish(`${channel}-${id}`, JSON.stringify(statistics));
      break;
    }
  }
});


RedisSubInstance.subscribe(...Object.values(CHANNELS), (err, count) => {
  console.log(`Subscribed on ${count} channels`);
});

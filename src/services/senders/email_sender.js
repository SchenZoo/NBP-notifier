const nodemailer = require('nodemailer');
const SMTPConfig = require('../../config/smtp');
const {
  addEmailFailedCount, addEmailPendingCount, addEmailSentCount, addEmailQueueCount, removeEmailQueueCount, getStatistics,
} = require('../statistics/email');
const { getQueuedEmail, addQueuedEmail } = require('../queue');

const { RedisPubInstance, RedisSubInstance } = require('../redis');

const EMAIL_CHANNELS = {
  EMAIL_PROCESSED: 'email-processed',
};

const EMAIL_STATUSES = {
  FAILED: 0,
  SENT: 1,
  PENDING: 2,
};

const config = SMTPConfig.SMTPOptions;
const transporter = nodemailer.createTransport(config);

const PENDING_THRESHOLD = 50;

async function sendEmail(mailData) {
  try {
    const pendingEmailsCount = await addEmailPendingCount();
    // Check if too many emails are sent right now
    if (+pendingEmailsCount > PENDING_THRESHOLD) {
      // if yes add to queue
      await addEmailQueueCount();
      await addQueuedEmail(mailData);
      return EMAIL_STATUSES.PENDING;
    }
    // if not, process email
    await transporter.sendMail(mailData);
    await addEmailSentCount();
  } catch (err) {
    console.error('Failed sending email', err.message);
    await addEmailFailedCount();
    // publish email has failed, but its processed
    await RedisPubInstance.publish(EMAIL_CHANNELS.EMAIL_PROCESSED, EMAIL_STATUSES.FAILED);
    return EMAIL_STATUSES.FAILED;
  }
  // publish email has been sent and its processed
  await RedisPubInstance.publish(EMAIL_CHANNELS.EMAIL_PROCESSED, EMAIL_STATUSES.SENT);
  return EMAIL_STATUSES.SENT;
}


RedisSubInstance.on('message', async (channel) => {
  if (channel === EMAIL_CHANNELS.EMAIL_PROCESSED) {
    await checkQueue();
  }
});

async function checkQueue() {
  const emailData = await getQueuedEmail();
  // if emails in queue try sending them
  if (emailData) {
    await removeEmailQueueCount();
    await sendEmail(emailData);
  }
}

// On load check if emails in queue
checkQueue();

// FOR TESTING QUEUE
// function sleep(ms) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

// setTimeout(() => {
//   sendEmail({ data: '1' });
//   sendEmail({ data: '2' });
//   sendEmail({ data: '3' });
//   sendEmail({ data: '4' });
// }, 1500);


RedisSubInstance.subscribe(EMAIL_CHANNELS.EMAIL_PROCESSED);


module.exports = {
  sendEmail,
};

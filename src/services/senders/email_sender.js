const nodemailer = require('nodemailer');
const SMTPConfig = require('../../config/smtp');
const { addEmailPending, addEmailFailed, addEmailSent } = require('../statistics/email');

const config = SMTPConfig.SMTPOptions;
const transporter = nodemailer.createTransport(config);

async function sendEmail(mailData) {
  try {
    await addEmailPending();
    await transporter.sendMail(mailData);
    await addEmailSent();
  } catch (err) {
    console.error('Failed sending email', err.message);
    await addEmailFailed();
    return false;
  }
  return true;
}


module.exports = {
  sendEmail,
};

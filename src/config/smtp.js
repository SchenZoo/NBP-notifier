const { SMTP_USERNAME } = process.env;
const { SMTP_PASSWORD } = process.env;
const { SMTP_HOST } = process.env;
const { SMTP_PORT } = process.env;
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false';

if (!SMTP_USERNAME || !SMTP_PASSWORD || !SMTP_HOST || !SMTP_PORT) {
  console.error('SMTP environment variables missing');
}

const SMTPOptions = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
};

module.exports = {
  SMTPOptions,
};

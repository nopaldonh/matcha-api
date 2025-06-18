import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  url: process.env.APP_URL,
  frontend: {
    name: process.env.APP_FRONTEND_NAME,
    url: process.env.APP_FRONTEND_URL,
    passwordResetUrl: process.env.APP_FRONTEND_PASSWORD_RESET_URL,
    verifyEmailUrl: process.env.APP_FRONTEND_VERIFY_EMAIL_URL,
  },
}));

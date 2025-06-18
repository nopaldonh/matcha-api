import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt-verify-email',
  (): JwtSignOptions => ({
    secret: process.env.JWT_VERIFY_EMAIL_SECRET,
    expiresIn: process.env.JWT_VERIFY_EMAIL_EXPIRES_IN,
  }),
);

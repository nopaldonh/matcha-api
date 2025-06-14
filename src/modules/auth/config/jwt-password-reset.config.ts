import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt-password-reset',
  (): JwtSignOptions => ({
    secret: process.env.JWT_PASSWORD_RESET_SECRET,
    expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN,
  }),
);

import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtVerifyEmailConfig from '../config/jwt-password-reset.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtVerifyEmailStrategy extends PassportStrategy(
  Strategy,
  'jwt-verify-email',
) {
  constructor(
    @Inject(jwtVerifyEmailConfig.KEY)
    private jwtVerifyEmailConfiguration: ConfigType<
      typeof jwtVerifyEmailConfig
    >,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      ignoreExpiration: false,
      secretOrKey: jwtVerifyEmailConfiguration.secret || '',
    });
  }

  validate(payload: AuthJwtPayload) {
    const email = payload.sub;
    return this.authService.validateVerifyEmailToken(email);
  }
}

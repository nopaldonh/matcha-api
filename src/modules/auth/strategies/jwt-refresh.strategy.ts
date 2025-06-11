import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtRefreshConfig from '../config/jwt-refresh.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshConfiguration.secret || '',
    });
  }

  validate(payload: AuthJwtPayload) {
    return { id: payload.sub };
  }
}

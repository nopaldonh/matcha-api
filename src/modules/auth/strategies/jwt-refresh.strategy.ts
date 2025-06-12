import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtRefreshConfig from '../config/jwt-refresh.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshConfiguration.secret || '',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.headers.authorization?.split(' ')[1] || '';
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}

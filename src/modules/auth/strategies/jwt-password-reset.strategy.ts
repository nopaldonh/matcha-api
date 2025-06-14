import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtPasswordResetConfig from '../config/jwt-password-reset.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class JwtPasswordResetStrategy extends PassportStrategy(
  Strategy,
  'jwt-password-reset',
) {
  constructor(
    @Inject(jwtPasswordResetConfig.KEY)
    private jwtPasswordResetConfiguration: ConfigType<
      typeof jwtPasswordResetConfig
    >,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      ignoreExpiration: false,
      secretOrKey: jwtPasswordResetConfiguration.secret || '',
      passReqToCallback: true,
    });
  }

  validate(req: Request<any, any, ResetPasswordDto>, payload: AuthJwtPayload) {
    const token = req.body.token;
    const email = payload.sub;
    return this.authService.validatePasswordResetToken(email, token);
  }
}

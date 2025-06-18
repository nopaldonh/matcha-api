import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtPasswordResetStrategy } from './strategies/jwt-password-reset.strategy';
import { JwtVerifyEmailStrategy } from './strategies/jwt-verify-email.strategy';
import appConfig from 'src/config/app.config';
import jwtConfig from './config/jwt.config';
import jwtRefreshConfig from './config/jwt-refresh.config';
import jwtPasswordResetConfig from './config/jwt-password-reset.config';
import jwtVerifyEmailConfig from './config/jwt-verify-email.config';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
    ConfigModule.forFeature(jwtPasswordResetConfig),
    ConfigModule.forFeature(jwtVerifyEmailConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtPasswordResetStrategy,
    JwtVerifyEmailStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

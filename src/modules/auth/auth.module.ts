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
import jwtConfig from './config/jwt.config';
import jwtRefreshConfig from './config/jwt-refresh.config';
import jwtPasswordResetConfig from './config/jwt-password-reset.config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(jwtRefreshConfig),
    ConfigModule.forFeature(jwtPasswordResetConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtPasswordResetStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

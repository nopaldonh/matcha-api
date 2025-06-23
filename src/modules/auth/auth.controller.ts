import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ZodGuard } from 'src/guards/zod.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { JwtPasswordResetAuthGuard } from './guards/jwt-password-reset-auth.guard';
import { JwtVerifyEmailAuthGuard } from './guards/jwt-verify-email-auth.guard';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerRequest: RegisterDto) {
    const result = await this.authService.register(registerRequest);
    return {
      message: 'Registration successful',
      data: result,
    };
  }

  @Post('login')
  @UseGuards(new ZodGuard('body', LoginDto), LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@CurrentUser() user: User) {
    const result = await this.authService.login(user.id);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@CurrentUser() user: User) {
    const result = await this.authService.refreshToken(user.id);
    return {
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user.id);
    return {
      message: 'Logout successful',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return {
      message: 'A reset link will be sent if the account exists',
    };
  }

  @Post('reset-password')
  @UseGuards(new ZodGuard('body', ResetPasswordDto), JwtPasswordResetAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @CurrentUser() user: User,
    @Body() body: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(user.email, body.password);
    return {
      message: 'Password has been reset successfully',
    };
  }

  @Post('email/verification-notification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async emailVerificationNotification(@CurrentUser() user: User) {
    await this.authService.emailVerificationNotification(user.id);
    return {
      message: 'Verification email has been sent successfully',
    };
  }

  @Post('verify-email')
  @UseGuards(new ZodGuard('body', VerifyEmailDto), JwtVerifyEmailAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@CurrentUser() user: User) {
    await this.authService.verifyEmail(user.email);
    return {
      message: 'Email has been verified successfully',
    };
  }
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { JwtPasswordResetAuthGuard } from './guards/jwt-password-reset-auth.guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerRequest: RegisterDto) {
    const result = await this.authService.register(registerRequest);
    return {
      statusCode: HttpStatus.OK,
      message: 'User registered successfully',
      data: result,
    };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(@Request() request: { user: User }) {
    return this.authService.login(request.user.id);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  refresh(@Request() request: { user: User }) {
    return this.authService.refreshToken(request.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Request() request: { user: User }) {
    return this.authService.logout(request.user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @UseGuards(JwtPasswordResetAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Request() request: { user: User },
    @Body() body: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(
      request.user.email,
      body.password,
    );
  }
}

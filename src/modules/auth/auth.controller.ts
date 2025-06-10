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
import { LocalAuthGuard } from './guards/local-auth.guard';
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
    const access_token = this.authService.login(request.user.id);
    return {
      id: request.user.id,
      access_token,
    };
  }
}

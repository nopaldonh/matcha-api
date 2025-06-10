import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

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
}

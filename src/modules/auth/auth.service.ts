import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import jwtRefreshConfig from './config/jwt-refresh.config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(jwtRefreshConfig.KEY)
    private jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>,
  ) {}

  async register(data: RegisterDto) {
    const errorsUniqueConstraint: Record<string, string>[] = [];

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: data.username,
      },
    });

    if (totalUserWithSameUsername != 0) {
      errorsUniqueConstraint.push({
        field: 'username',
        message: 'Username already exists',
      });
    }

    const totalUserWithSameEmail = await this.prismaService.user.count({
      where: {
        email: data.email,
      },
    });

    if (totalUserWithSameEmail != 0) {
      errorsUniqueConstraint.push({
        field: 'email',
        message: 'Email already exists',
      });
    }

    const totalUserWithSamePhone = await this.prismaService.user.count({
      where: {
        phone: data.phone,
      },
    });

    if (totalUserWithSamePhone != 0) {
      errorsUniqueConstraint.push({
        field: 'phone',
        message: 'Phone already exists',
      });
    }

    if (errorsUniqueConstraint.length != 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: errorsUniqueConstraint,
      });
    }

    data.password = await bcrypt.hash(data.password, 10);

    const user = await this.prismaService.user.create({ data });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    }

    return { id: user.id };
  }

  login(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(
      payload,
      this.jwtRefreshConfiguration,
    );
    return {
      id: userId,
      access_token,
      refresh_token,
    };
  }

  refreshToken(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const access_token = this.jwtService.sign(payload);
    return {
      id: userId,
      access_token,
    };
  }
}

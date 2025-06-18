import {
  BadRequestException,
  ForbiddenException,
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
import * as argon2 from 'argon2';
import * as ms from 'ms';
import { MailService } from 'src/mail/mail.service';
import { UserService } from '../user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import appConfig from 'src/config/app.config';
import jwtRefreshConfig from './config/jwt-refresh.config';
import jwtPasswordResetConfig from './config/jwt-password-reset.config';
import jwtVerifyEmailConfig from './config/jwt-verify-email.config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private userService: UserService,
    @Inject(appConfig.KEY)
    private appConfiguration: ConfigType<typeof appConfig>,
    @Inject(jwtRefreshConfig.KEY)
    private jwtRefreshConfiguration: ConfigType<typeof jwtRefreshConfig>,
    @Inject(jwtPasswordResetConfig.KEY)
    private jwtPasswordResetConfiguration: ConfigType<
      typeof jwtPasswordResetConfig
    >,
    @Inject(jwtVerifyEmailConfig.KEY)
    private jwtVerifyEmailConfiguration: ConfigType<
      typeof jwtVerifyEmailConfig
    >,
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

  async login(userId: string) {
    const { access_token, refresh_token } = await this.generateTokens(userId);
    await this.updateRefreshToken(userId, refresh_token);
    return {
      id: userId,
      access_token,
      refresh_token,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.jwtRefreshConfiguration),
    ]);
    return { access_token, refresh_token };
  }

  async refreshToken(userId: string) {
    const { access_token, refresh_token } = await this.generateTokens(userId);
    await this.updateRefreshToken(userId, refresh_token);
    return {
      id: userId,
      access_token,
      refresh_token,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    if (refreshToken) {
      refreshToken = await argon2.hash(refreshToken);
    }
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOne({ id: userId });
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Access denied',
        error: 'Unauthorized',
      });
    }

    const isRefreshTokenMatch = await argon2.verify(
      user.refresh_token,
      refreshToken,
    );
    if (!isRefreshTokenMatch) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      });
    }

    return { id: userId };
  }

  async logout(userId: string) {
    await this.updateRefreshToken(userId, null);
  }

  async forgotPassword(email: string) {
    const totalUser = await this.prismaService.user.count({ where: { email } });
    if (totalUser != 0) {
      await this.prismaService.passwordResetToken.deleteMany({
        where: { email },
      });

      const payload: AuthJwtPayload = { sub: email };
      const token = this.jwtService.sign(
        payload,
        this.jwtPasswordResetConfiguration,
      );

      const hashedToken = await argon2.hash(token);
      await this.prismaService.passwordResetToken.create({
        data: {
          email,
          token: hashedToken,
        },
      });

      const resetBaseUrl = this.appConfiguration.frontend.passwordResetUrl;
      const tokenExpiresIn = this.jwtPasswordResetConfiguration.expiresIn;
      const resetLink = `${resetBaseUrl}/${token}`;
      const resetLinkExpiresIn = ms(ms(tokenExpiresIn as ms.StringValue), {
        long: true,
      });
      await this.mailService.sendPasswordResetEmail(
        email,
        resetLink,
        resetLinkExpiresIn,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'A reset link will be sent if the account exists.',
    };
  }

  async resetPassword(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    await this.prismaService.passwordResetToken.delete({ where: { email } });
    return {
      statusCode: HttpStatus.OK,
      message: 'Password has been reset',
    };
  }

  async validatePasswordResetToken(email: string, token: string) {
    const record = await this.prismaService.passwordResetToken.findUnique({
      where: { email },
    });

    if (!record) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Reset token not found or expired',
      });
    }

    const isTokenMatch = await argon2.verify(record.token, token);
    if (!isTokenMatch) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Invalid reset token',
      });
    }

    return { email };
  }

  async emailVerificationNotification(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (user?.email_verified_at) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User email is already verified',
      };
    }

    const payload: AuthJwtPayload = { sub: user!.email };
    const token = this.jwtService.sign(
      payload,
      this.jwtPasswordResetConfiguration,
    );

    const verifyBaseUrl = this.appConfiguration.frontend.verifyEmailUrl;
    const tokenExpiresIn = this.jwtVerifyEmailConfiguration.expiresIn;
    const verifyLink = `${verifyBaseUrl}/${token}`;
    const verifyLinkExpiresIn = ms(ms(tokenExpiresIn as ms.StringValue), {
      long: true,
    });
    await this.mailService.sendEmailVerificationNotification(
      user!.email,
      verifyLink,
      verifyLinkExpiresIn,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Verification email sent',
    };
  }

  async verifyEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (user?.email_verified_at) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User email is already verified',
      };
    }

    await this.prismaService.user.update({
      where: { email },
      data: { email_verified_at: new Date() },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Email successfully verified',
    };
  }

  async validateVerifyEmailToken(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User not found or token expired',
      });
    }

    return { email };
  }
}

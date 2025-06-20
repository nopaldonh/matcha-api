import {
  BadRequestException,
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
    const errors: Record<string, string[]> = {};

    const [usernameCount, emailCount, phoneCount] = await Promise.all([
      this.prismaService.user.count({ where: { username: data.username } }),
      this.prismaService.user.count({ where: { email: data.email } }),
      this.prismaService.user.count({ where: { phone: data.phone } }),
    ]);

    if (usernameCount > 0) {
      errors['username'] = ['Username already exists'];
    }

    if (emailCount > 0) {
      errors['email'] = ['Email already exists'];
    }

    if (phoneCount > 0) {
      errors['phone'] = ['Phone already exists'];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
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
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id };
  }

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    await this.updateRefreshToken(userId, refreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.jwtRefreshConfiguration),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    await this.updateRefreshToken(userId, refreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const isRefreshTokenMatch = await argon2.verify(
      user.refresh_token,
      refreshToken,
    );
    if (!isRefreshTokenMatch) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return { id: userId };
  }

  async logout(userId: string) {
    await this.updateRefreshToken(userId, null);
  }

  async forgotPassword(email: string) {
    const userCount = await this.prismaService.user.count({ where: { email } });
    if (userCount == 0) return;

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

  async resetPassword(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    await this.prismaService.passwordResetToken.delete({ where: { email } });
  }

  async validatePasswordResetToken(email: string, token: string) {
    const record = await this.prismaService.passwordResetToken.findUnique({
      where: { email },
    });
    if (!record) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    const isTokenMatch = await argon2.verify(record.token, token);
    if (!isTokenMatch) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    return { email };
  }

  async emailVerificationNotification(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.email_verified_at) {
      throw new BadRequestException('Email is already verified');
    }

    const payload: AuthJwtPayload = { sub: user.email };
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
      user.email,
      verifyLink,
      verifyLinkExpiresIn,
    );
  }

  async verifyEmail(email: string) {
    await this.prismaService.user.update({
      where: { email },
      data: { email_verified_at: new Date() },
    });
  }

  async validateVerifyEmailToken(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException(
        'Verification token is invalid or has expired',
      );
    }
    if (user.email_verified_at) {
      throw new BadRequestException('Email is already verified');
    }

    return { email };
  }
}

import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

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
}

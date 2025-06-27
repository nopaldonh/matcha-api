import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { userResponseSchema } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findByEmail(email: string) {
    return await this.findOne({ email });
  }

  toUserResponse(user: User) {
    return userResponseSchema.parse(user);
  }
}

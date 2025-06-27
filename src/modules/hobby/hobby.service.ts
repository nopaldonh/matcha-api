import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { handlePrismaNotFoundError, handlePrismaUniqueError } from 'src/utils';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { UpdateHobbyDto } from './dto/update-hobby.dto';

@Injectable()
export class HobbyService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateHobbyDto) {
    return await this.prismaService.hobby.create({ data }).catch((error) => {
      handlePrismaUniqueError(error, 'name');
    });
  }

  async findAll() {
    return await this.prismaService.hobby.findMany();
  }

  async findOne(where: Prisma.HobbyWhereUniqueInput) {
    const hobby = await this.prismaService.hobby.findUnique({ where });
    if (!hobby) {
      throw new NotFoundException('Hobby not found');
    }
    return hobby;
  }

  async update(id: number, data: UpdateHobbyDto) {
    return await this.prismaService.hobby
      .update({
        where: { id },
        data,
      })
      .catch((error) => {
        handlePrismaNotFoundError(error);
      });
  }
}

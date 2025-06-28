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
    return await this.prismaService.hobby.findMany({
      where: { deleted_at: null },
    });
  }

  async findOne(where: Prisma.HobbyWhereUniqueInput) {
    const hobby = await this.prismaService.hobby.findUnique({
      where: {
        ...where,
        deleted_at: null,
      },
    });
    if (!hobby) {
      throw new NotFoundException('Hobby not found');
    }
    return hobby;
  }

  async update(id: number, data: UpdateHobbyDto) {
    return await this.prismaService.hobby
      .update({
        where: {
          id,
          deleted_at: null,
        },
        data,
      })
      .catch((error) => {
        handlePrismaNotFoundError(error);
      });
  }

  async softDelete(id: number) {
    return this.prismaService.hobby
      .update({
        where: {
          id,
          deleted_at: null,
        },
        data: { deleted_at: new Date() },
      })
      .catch((error) => {
        handlePrismaNotFoundError(error);
      });
  }
}

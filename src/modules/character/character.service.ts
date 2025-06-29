import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { handlePrismaNotFoundError, handlePrismaUniqueError } from 'src/utils';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharacterService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateCharacterDto) {
    return await this.prismaService.character
      .create({ data })
      .catch((error) => {
        handlePrismaUniqueError(error, 'name');
      });
  }

  async findAll() {
    return await this.prismaService.character.findMany({
      where: { deleted_at: null },
    });
  }

  async findOne(where: Prisma.CharacterWhereUniqueInput) {
    return await this.prismaService.character
      .findUniqueOrThrow({
        where: {
          ...where,
          deleted_at: null,
        },
      })
      .catch((error) => {
        handlePrismaNotFoundError(error);
      });
  }

  async update(id: number, data: UpdateCharacterDto) {
    return await this.prismaService.character
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
    return this.prismaService.character
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

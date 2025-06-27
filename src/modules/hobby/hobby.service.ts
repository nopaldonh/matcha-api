import { Injectable } from '@nestjs/common';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { PrismaService } from 'nestjs-prisma';
import { handlePrismaUniqueError } from 'src/utils';

@Injectable()
export class HobbyService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateHobbyDto) {
    return await this.prismaService.hobby.create({ data }).catch((error) => {
      handlePrismaUniqueError(error, 'name');
    });
  }
}

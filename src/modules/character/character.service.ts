import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { handlePrismaUniqueError } from 'src/utils';
import { CreateCharacterDto } from './dto/create-character.dto';

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
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';

@Controller('characters')
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Post()
  async create(@Body() body: CreateCharacterDto) {
    const result = await this.characterService.create(body);
    return {
      message: 'Character created successfully',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.characterService.findAll();
    return {
      message: 'Characters retrieved successfully',
      data: result,
    };
  }
}

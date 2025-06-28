import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { GetCharacterDto } from './dto/get-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

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

  @Get(':id')
  async findOne(@Param() { id }: GetCharacterDto) {
    const result = await this.characterService.findOne({ id });
    return {
      message: 'Character retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param() { id }: GetCharacterDto,
    @Body() body: UpdateCharacterDto,
  ) {
    const result = await this.characterService.update(id, body);
    return {
      message: 'Character updated successfully',
      data: result,
    };
  }
}

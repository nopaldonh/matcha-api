import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { HobbyService } from './hobby.service';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { GetHobbyDto } from './dto/get-hobby.dto';
import { UpdateHobbyDto } from './dto/update-hobby.dto';

@Controller('hobbies')
export class HobbyController {
  constructor(private readonly hobbyService: HobbyService) {}

  @Post()
  async create(@Body() body: CreateHobbyDto) {
    const result = await this.hobbyService.create(body);
    return {
      message: 'Hobby created successfully',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.hobbyService.findAll();
    return {
      message: 'Hobbies retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param() { id }: GetHobbyDto) {
    const result = await this.hobbyService.findOne({ id });
    return {
      message: 'Hobby retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(@Param() { id }: GetHobbyDto, @Body() body: UpdateHobbyDto) {
    const result = await this.hobbyService.update(id, body);
    return {
      message: 'Hobby updated successfully',
      data: result,
    };
  }
}

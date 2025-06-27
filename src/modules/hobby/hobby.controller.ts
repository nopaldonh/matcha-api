import { Body, Controller, Get, Post } from '@nestjs/common';
import { HobbyService } from './hobby.service';
import { CreateHobbyDto } from './dto/create-hobby.dto';

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
}

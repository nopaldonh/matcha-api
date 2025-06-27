import { Body, Controller, Post } from '@nestjs/common';
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
}

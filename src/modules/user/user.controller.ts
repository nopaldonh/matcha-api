import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.userService.findOne({ id });
    return {
      message: 'User retrieved successfully',
      data: result && this.userService.toUserResponse(result),
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    console.log(req.user.id);
    console.log(req.user.email);

    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.userService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

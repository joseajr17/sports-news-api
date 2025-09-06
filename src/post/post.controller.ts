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
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postService.create(createPostDto, req.user);
  }

  @Get(':slug')
  async findOnePublished(@Param('slug') slug: string) {
    return this.postService.findOnePublished(slug);
  }

  @Get()
  async findAllPublished() {
    return this.postService.findAllPublished();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findOneOwned(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postService.findOneOwnedOrFail({ id }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findAllOwned(@Req() req: AuthenticatedRequest) {
    return this.postService.findAllOwned(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postService.update({ id }, updatePostDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/:id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postService.remove({ id }, req.user);
  }
}

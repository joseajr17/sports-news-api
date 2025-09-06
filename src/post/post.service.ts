import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PostResponseDto } from './dto/post-response.dto';
import { createSlugFromText } from 'src/commom/utils/create-slug-from-text';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, author: User) {
    const { title, excerpt, content, coverImageUrl } = createPostDto;

    const newPost = this.postRepository.create({
      author,
      content,
      excerpt,
      coverImageUrl,
      slug: createSlugFromText(title),
      title,
    });

    const postCreated = await this.save(
      this.postRepository.create(newPost),
    ).catch((e: unknown) => {
      if (e instanceof Error)
        this.logger.error('Erro ao criar o post', e.stack);

      throw new BadRequestException('Erro ao criar o post');
    });

    return new PostResponseDto(postCreated);
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }

  // Métodos auxiliares
  save(post: Post) {
    return this.postRepository.save(post);
  }
}

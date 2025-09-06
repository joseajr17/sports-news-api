import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

  async findOneOwnedOrFail(postData: Partial<Post>, author: User) {
    const post = await this.findOneOwned(postData, author);

    if (!post) throw new NotFoundException('Post não encontrado');

    return post;
  }

  async findAllOwned(author: User) {
    const posts = await this.postRepository.find({
      where: {
        author: { id: author.id },
      },
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
    return posts;
  }

  async findOnePublished(slug: string) {
    const post = await this.findOneOrFail({
      slug,
      published: true,
    });
    return new PostResponseDto(post);
  }

  async findAllPublished() {
    const posts = await this.findAll({ published: true });
    return posts.map(post => new PostResponseDto(post));
  }

  async update(
    postData: Partial<Post>,
    updatePostDto: UpdatePostDto,
    author: User,
  ) {
    if (Object.keys(updatePostDto).length === 0)
      throw new BadRequestException('Dados não enviados');

    const post = await this.findOneOwnedOrFail(postData, author);

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;
    post.excerpt = updatePostDto.excerpt ?? post.excerpt;
    post.coverImageUrl = updatePostDto.coverImageUrl ?? post.coverImageUrl;
    post.published = updatePostDto.published ?? post.published;

    const postUpdated = await this.save(post);

    return new PostResponseDto(postUpdated);
  }

  async remove(postData: Partial<Post>, author: User) {
    const post = await this.findOneOrFail(postData);

    await this.postRepository.delete({
      ...postData,
      author: { id: author.id },
    });

    return new PostResponseDto(post);
  }

  // Métodos auxiliares
  save(post: Post) {
    return this.postRepository.save(post);
  }

  async findOneOwned(postData: Partial<Post>, author: User) {
    const post = await this.postRepository.findOne({
      where: {
        ...postData,
        author: { id: author.id },
      },
      relations: ['author'],
    });

    return post;
  }

  async findOne(postData: Partial<Post>) {
    const post = await this.postRepository.findOne({
      where: postData,
      relations: ['author'],
    });

    return post;
  }

  async findOneOrFail(postData: Partial<Post>) {
    const post = await this.findOne(postData);

    if (!post) throw new NotFoundException('Post não encontrado');

    return post;
  }

  async findAll(postData: Partial<Post>) {
    const posts = await this.postRepository.find({
      where: postData,
      order: {
        createdAt: 'DESC',
      },
      relations: ['author'],
    });

    return posts;
  }
}

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'O título precisa ser uma string' })
  @Length(10, 150, {
    message: 'O título precisa ter entre 10 e 150 caracteres',
  })
  title: string;

  @IsString({ message: 'O excerto precisa ser uma string' })
  @Length(10, 200, {
    message: 'O excerto precisa ter entre 10 e 200 caracteres',
  })
  excerpt: string;

  @IsString({ message: 'O conteúdo precisa ser uma string' })
  @IsNotEmpty({ message: 'O conteúdo não pode ficar vazio' })
  content: string;

  @IsOptional()
  @IsUrl({ require_tld: false }) // Top level domain proíbe localhost e IP
  coverImageUrl?: string;
}

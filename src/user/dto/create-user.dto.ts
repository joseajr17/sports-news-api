import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O nome precisa ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'A senha precisa ser uma string' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia' })
  @MinLength(6, { message: 'A senha deve ter um mínimo de 6 caracteres' })
  password: string;
}

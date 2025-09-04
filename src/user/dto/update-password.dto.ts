import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'A senha precisa ser uma string' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia' })
  currentPassword: string;

  @IsString({ message: 'A nova senha precisa ser uma string' })
  @IsNotEmpty({ message: 'A nova senha não pode ser vazia' })
  @MinLength(6, { message: 'A nova senha deve ter um mínimo de 6 caracteres' })
  newPassword: string;
}

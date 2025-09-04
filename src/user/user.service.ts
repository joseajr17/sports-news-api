import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/commom/hashing/hashing.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Verificar se já existe um user com o E-mail informado
    await this.failIfEmailExists(email);

    // Hash de senha
    const passwordHash = await this.hashingService.hash(password);

    const newUser = {
      name,
      email,
      password: passwordHash,
    };

    const userCreated = await this.save(this.userRepository.create(newUser));

    return new UserResponseDto(userCreated);
  }

  async findOne(id: string) {
    const user = await this.findOneByOrFail({ id });
    return new UserResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { name, email } = updateUserDto;

    if (!name && !email) throw new BadRequestException('Dados não enviados');

    const user = await this.findOneByOrFail({ id });

    user.name = name ?? user.name;

    if (email && email !== user.email) {
      // Verificar se já existe um user com o E-mail informado
      await this.failIfEmailExists(email);
      user.email = email;
      user.forceLogout = true;
    }

    const userUpdated = await this.save(user);
    return new UserResponseDto(userUpdated);
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.findOneByOrFail({ id });

    const isCurrentPasswordValid = await this.hashingService.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid)
      throw new UnauthorizedException('Senha atual inválida');

    user.password = await this.hashingService.hash(
      updatePasswordDto.newPassword,
    );
    user.forceLogout = true;

    const userUpdated = await this.save(user);
    return new UserResponseDto(userUpdated);
  }

  async remove(id: string) {
    const user = await this.findOneByOrFail({ id });
    await this.userRepository.delete({ id });
    return new UserResponseDto(user);
  }

  // Métodos auxiliares
  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findById(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  save(user: User) {
    return this.userRepository.save(user);
  }

  async failIfEmailExists(email: string) {
    const existsUser = await this.userRepository.existsBy({
      email,
    });

    if (existsUser) throw new ConflictException('Email já existe');
  }

  async findOneByOrFail(userData: Partial<User>) {
    const user = await this.userRepository.findOneByOrFail(userData);

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
  }
}

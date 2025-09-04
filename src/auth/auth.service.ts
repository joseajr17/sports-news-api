import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { HashingService } from 'src/commom/hashing/hashing.service';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar user por E-mail
    const user = await this.userService.findByEmail(email);
    const error = new UnauthorizedException('Usuário ou senha inválida');

    if (!user) throw error;

    // Comparar senha digitada com a do BD
    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) throw error;

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const acessToken = await this.jwtService.signAsync(jwtPayload);

    user.forceLogout = false;
    await this.userService.save(user);

    return { acessToken };
  }
}

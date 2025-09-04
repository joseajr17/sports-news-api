import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    const secret = process.env.JWT_SECRET;

    if (!secret)
      throw new InternalServerErrorException(
        'JWT_SECRET não encontrada no .env',
      );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(jwtPayload: JwtPayload) {
    const user = await this.userService.findById(jwtPayload.sub);

    if (!user || user.forceLogout)
      throw new UnauthorizedException('Você precisa fazer login');

    return user;
  }
}

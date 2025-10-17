import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
    });
  }

  async validate(payload: { id: string; username: string }): Promise<User> {
    const { id } = payload;
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException('Token inválido, usuario no encontrado.');
    }

    return user;
  }
}
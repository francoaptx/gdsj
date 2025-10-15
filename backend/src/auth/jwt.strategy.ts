// coinssjj/backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Aquí puedes cargar al usuario si lo necesitas en req.user
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      sub: payload.sub,
    };
  }
}
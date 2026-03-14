import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { Login } from 'src/entities/login';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async login(dto: Login) {
    const user = await this.users.validateCredentials(dto);
    const permissions = await this.users.getPermissions(user.roleId);
    return {
      access_token: this.jwt.sign(
        { sub: user.id, name: user.name, permissions },
        { expiresIn: '15m' },
      ),
      refresh_token: this.jwt.sign({ sub: user.id }, { expiresIn: '7d' }),
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    const permissions = await this.users.getPermissions(user.roleId);
    return {
      access_token: this.jwt.sign(
        { sub: user.id, name: user.name, permissions },
        { expiresIn: '15m' },
      ),
    };
  }
}

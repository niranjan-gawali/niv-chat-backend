import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { User } from 'src/users/entities/user.entity/user.entity';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: User, response: Response) {
    const expires = new Date();
    expires.setSeconds(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expires.getSeconds() + this.configService.getOrThrow('JWT_EXPIRATION'),
    );

    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      username: user.username,
      email: user.email,
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      secure: false,
      expires: new Date(0),
      path: '/',
    });
  }

  // Verify JWT
  verifyWs(request: Request): TokenPayload {
    const cookies: string[] = request?.headers?.cookie?.split(': ') ?? [];
    const authCookie = cookies.find((ck) => ck.includes('Authentication'));
    const jwt = authCookie?.split('Authentication=')[1] ?? '';
    return this.jwtService.verify(jwt);
  }
}

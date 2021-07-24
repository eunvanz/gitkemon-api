import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { NextFunction, Request } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/constants/cookies';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.signedCookies[ACCESS_TOKEN_COOKIE_NAME];
    if (token) {
      try {
        await axios.get(`${process.env.GITHUB_API_BASE_URL}/user`, {
          headers: { Authorization: `token ${token}` },
        });
      } catch (error) {
        throw new UnauthorizedException('Token is invalid.');
      }
      req.headers[ACCESS_TOKEN_HEADER_NAME] = token;
    }
    next();
  }
}

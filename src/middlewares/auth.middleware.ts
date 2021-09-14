import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/constants/cookies';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token =
      req.cookies?.[ACCESS_TOKEN_COOKIE_NAME] ||
      req.headers[ACCESS_TOKEN_HEADER_NAME];
    if (token) {
      // try {
      //   await axios.get(`${process.env.GITHUB_API_BASE_URL}/user`, {
      //     headers: { Authorization: `token ${token}` },
      //   });
      // } catch (error) {
      //   res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
      //   throw new UnauthorizedException({
      //     errorCode: ERROR_CODE.INVALID_TOKEN,
      //     errorMessage: 'Token is invalid.',
      //   });
      // }
      req.headers[ACCESS_TOKEN_HEADER_NAME] = token;
    }
    next();
  }
}

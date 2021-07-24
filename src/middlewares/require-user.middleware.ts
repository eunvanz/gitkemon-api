import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';

@Injectable()
export class RequireMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers[ACCESS_TOKEN_HEADER_NAME];
    if (!token) {
      throw new ForbiddenException('Login is required.');
    }
    next();
  }
}

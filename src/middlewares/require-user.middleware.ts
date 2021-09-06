import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { ERROR_CODE } from 'src/constants/errors';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';

@Injectable()
export class RequireMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers[ACCESS_TOKEN_HEADER_NAME];
    if (!token) {
      console.log('===== log in is required');
      throw new ForbiddenException({
        errorCode: ERROR_CODE.LOGIN_REQUIRED,
        errorMessage: 'Login is required.',
      });
    }
    next();
  }
}

import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction } from 'express';

export class RequireMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const user = req.headers['x-user'];
    if (!user) {
      throw new UnauthorizedException('Login is required.');
    }
    next();
  }
}

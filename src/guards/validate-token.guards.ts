import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ACCESS_TOKEN_COOKIE_NAME } from 'src/constants/cookies';
import { ERROR_CODE } from 'src/constants/errors';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers[ACCESS_TOKEN_HEADER_NAME];
    if (typeof accessToken === 'string') {
      const user = await this.userService.findOneByAccessToken(accessToken);
      if (!user) {
        const response = context.switchToHttp().getResponse();
        response.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
        throw new UnauthorizedException({
          errorCode: ERROR_CODE.INVALID_TOKEN,
          errorMessage: 'Token is invalid.',
        });
      } else {
        return true;
      }
    } else {
      throw new ForbiddenException({
        errorCode: ERROR_CODE.LOGIN_REQUIRED,
        errorMessage: 'Login is required.',
      });
    }
  }
}

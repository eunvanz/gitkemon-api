import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODE } from 'src/constants/errors';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { ROLES_HIERARCHY } from 'src/constants/rules';
import { Role } from 'src/types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers[ACCESS_TOKEN_HEADER_NAME];
    if (typeof accessToken === 'string') {
      const user = await this.userService.findOneByAccessToken(accessToken);
      return roles.every(
        (role) => ROLES_HIERARCHY[role] <= ROLES_HIERARCHY[user.role],
      );
    } else {
      throw new ForbiddenException({
        errorCode: ERROR_CODE.LOGIN_REQUIRED,
        errorMessage: 'Login is required.',
      });
    }
  }
}

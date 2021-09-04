import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN_HEADER_NAME } from 'src/constants/headers';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers[ACCESS_TOKEN_HEADER_NAME];
    if (typeof accessToken === 'string') {
      const user = await this.userService.findOneByAccessToken(accessToken);
      return roles.includes(user.role);
    }
    return false;
  }
}

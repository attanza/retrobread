import { IRole } from '@/modules/role/role.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roleSlug = this.reflector.get<string>('role', context.getHandler());
    if (!roleSlug) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const role = request.user.role as IRole;
    if (!role) {
      return false;
    }
    return role.slug === roleSlug;
  }
}

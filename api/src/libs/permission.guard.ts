import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string[]>(
      'permission',
      context.getHandler(),
    );
    if (!permission) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userPermissions = request.user.role.permissions;
    if (!userPermissions) {
      return false;
    }
    const permissions = [];
    userPermissions.map(p => permissions.push(p.slug));
    return permissions.includes(permission);
  }
}

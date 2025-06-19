import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.isCreator == true) {
      throw new UnauthorizedException('Access denied. Admin only.');
    }

    return true;
  }
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Access denied. Admin only.');
    }

    return true;
  }
}
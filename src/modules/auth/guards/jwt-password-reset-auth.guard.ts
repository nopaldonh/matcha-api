import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtPasswordResetAuthGuard extends AuthGuard('jwt-password-reset') {
  handleRequest(err, user): any {
    if (err || !user) {
      throw (
        err || new BadRequestException('Reset token is invalid or has expired')
      );
    }

    return user;
  }
}

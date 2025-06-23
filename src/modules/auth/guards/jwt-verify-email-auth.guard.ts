import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtVerifyEmailAuthGuard extends AuthGuard('jwt-verify-email') {
  handleRequest(err, user): any {
    if (err || !user) {
      throw (
        err ||
        new BadRequestException('Verification token is invalid or has expired')
      );
    }

    return user;
  }
}

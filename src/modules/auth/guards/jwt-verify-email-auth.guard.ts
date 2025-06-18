import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtVerifyEmailAuthGuard extends AuthGuard('jwt-verify-email') {}

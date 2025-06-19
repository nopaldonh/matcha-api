import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from 'src/types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionRes = exception.getResponse();
    const errorRes: ApiResponse = { success: false };

    if (typeof exceptionRes === 'string') {
      errorRes.message = exceptionRes;
    } else if (typeof exceptionRes === 'object') {
      const exceptionResObj = exceptionRes as ApiResponse;
      errorRes.message = exceptionResObj.message;
      errorRes.errors = exceptionResObj.errors;
    }

    response.status(status).json(errorRes);
  }
}

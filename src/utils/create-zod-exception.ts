import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

export function createZodException(error: ZodError) {
  const fieldErrors = error.formErrors.fieldErrors;
  return new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Validation failed',
    errors: fieldErrors,
  });
}

import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    const fieldErrors = error.formErrors.fieldErrors;
    return new BadRequestException({
      statusCode: 400,
      message: 'Validation failed',
      errors: fieldErrors,
    });
  },
});

import { createZodValidationPipe } from 'nestjs-zod';
import { createZodException } from 'src/utils';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: createZodException,
});

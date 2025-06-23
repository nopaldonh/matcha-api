import { createZodGuard } from 'nestjs-zod';
import { createZodException } from 'src/utils';

export const ZodGuard = createZodGuard({
  createValidationException: createZodException,
});

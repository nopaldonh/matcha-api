import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}

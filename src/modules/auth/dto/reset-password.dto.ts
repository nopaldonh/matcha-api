import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().max(100),
  username: z.string().max(100),
  email: z.string().email().max(100),
  phone: z.string().max(20),
  password: z.string().min(8).max(100),
});

export class RegisterDto extends createZodDto(registerSchema) {}

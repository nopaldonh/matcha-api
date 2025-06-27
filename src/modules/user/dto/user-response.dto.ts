import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  email_verified_at: z.date().nullable(),
  phone: z.string(),
  phone_verified_at: z.date().nullable(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

export class UserResponseDto extends createZodDto(userResponseSchema) {}

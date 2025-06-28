import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCharacterSchema = z.object({
  name: z.string().min(1, 'Required'),
});

export class CreateCharacterDto extends createZodDto(createCharacterSchema) {}

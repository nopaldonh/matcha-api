import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createHobbySchema = z.object({
  name: z.string().min(1, 'Required'),
});

export class CreateHobbyDto extends createZodDto(createHobbySchema) {}

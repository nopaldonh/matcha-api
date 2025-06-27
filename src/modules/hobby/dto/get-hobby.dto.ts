import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getHobbySchema = z.object({
  id: z.coerce.number(),
});

export class GetHobbyDto extends createZodDto(getHobbySchema) {}

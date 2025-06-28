import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getCharacterSchema = z.object({
  id: z.coerce.number(),
});

export class GetCharacterDto extends createZodDto(getCharacterSchema) {}

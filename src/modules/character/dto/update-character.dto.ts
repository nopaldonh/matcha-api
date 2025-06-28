import { createZodDto } from 'nestjs-zod';
import { createCharacterSchema } from './create-character.dto';

export const updateCharacterSchema = createCharacterSchema.required();

export class UpdateCharacterDto extends createZodDto(updateCharacterSchema) {}

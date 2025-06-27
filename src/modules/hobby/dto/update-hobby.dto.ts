import { createZodDto } from 'nestjs-zod';
import { createHobbySchema } from './create-hobby.dto';

export const updateHobbySchema = createHobbySchema.required();

export class UpdateHobbyDto extends createZodDto(updateHobbySchema) {}

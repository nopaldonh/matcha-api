import { BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { capitalize } from './string';

export function handlePrismaUniqueError(
  error: unknown,
  fieldName: string,
  errorMessage?: string,
) {
  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    (error.meta?.target as string).includes(fieldName)
  ) {
    const errors: Record<string, string[]> = {
      name: [errorMessage ?? `${capitalize(fieldName)} is already exists`],
    };
    throw new BadRequestException({
      message: 'Validation failed',
      errors,
    });
  }
}

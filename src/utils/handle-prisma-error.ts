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

export function handlePrismaNotFoundError(
  error: unknown,
  modelName?: string,
  errorMessage?: string,
) {
  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    modelName = modelName ?? (error.meta?.modelName as string);
    errorMessage = errorMessage ?? `${modelName} not found`;
    throw new BadRequestException(errorMessage);
  }
}

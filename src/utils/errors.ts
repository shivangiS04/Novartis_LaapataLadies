/**
 * Custom Error Classes
 */

export class ApplicationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized access') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Access forbidden') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('CONFLICT', message, 409, context);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message: string, error?: Error) {
    super('INTERNAL_SERVER_ERROR', message, 500, { originalError: error?.message });
    this.name = 'InternalServerError';
  }
}

export class DataIngestionError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('DATA_INGESTION_ERROR', message, 400, context);
    this.name = 'DataIngestionError';
  }
}

export class DataQualityError extends ApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('DATA_QUALITY_ERROR', message, 400, context);
    this.name = 'DataQualityError';
  }
}

export class EncryptionError extends ApplicationError {
  constructor(message: string) {
    super('ENCRYPTION_ERROR', message, 500);
    this.name = 'EncryptionError';
  }
}

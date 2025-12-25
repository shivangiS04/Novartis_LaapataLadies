"use strict";
/**
 * Custom Error Classes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionError = exports.DataQualityError = exports.DataIngestionError = exports.InternalServerError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    constructor(code, message, statusCode = 500, context) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        this.name = 'ApplicationError';
    }
}
exports.ApplicationError = ApplicationError;
class ValidationError extends ApplicationError {
    constructor(message, context) {
        super('VALIDATION_ERROR', message, 400, context);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends ApplicationError {
    constructor(resource, id) {
        super('NOT_FOUND', `${resource} with id ${id} not found`, 404, { resource, id });
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends ApplicationError {
    constructor(message = 'Unauthorized access') {
        super('UNAUTHORIZED', message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApplicationError {
    constructor(message = 'Access forbidden') {
        super('FORBIDDEN', message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends ApplicationError {
    constructor(message, context) {
        super('CONFLICT', message, 409, context);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends ApplicationError {
    constructor(message, error) {
        super('INTERNAL_SERVER_ERROR', message, 500, { originalError: error?.message });
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
class DataIngestionError extends ApplicationError {
    constructor(message, context) {
        super('DATA_INGESTION_ERROR', message, 400, context);
        this.name = 'DataIngestionError';
    }
}
exports.DataIngestionError = DataIngestionError;
class DataQualityError extends ApplicationError {
    constructor(message, context) {
        super('DATA_QUALITY_ERROR', message, 400, context);
        this.name = 'DataQualityError';
    }
}
exports.DataQualityError = DataQualityError;
class EncryptionError extends ApplicationError {
    constructor(message) {
        super('ENCRYPTION_ERROR', message, 500);
        this.name = 'EncryptionError';
    }
}
exports.EncryptionError = EncryptionError;
//# sourceMappingURL=errors.js.map
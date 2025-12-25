/**
 * Custom Error Classes
 */
export declare class ApplicationError extends Error {
    code: string;
    statusCode: number;
    context?: Record<string, unknown> | undefined;
    constructor(code: string, message: string, statusCode?: number, context?: Record<string, unknown> | undefined);
}
export declare class ValidationError extends ApplicationError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class NotFoundError extends ApplicationError {
    constructor(resource: string, id: string);
}
export declare class UnauthorizedError extends ApplicationError {
    constructor(message?: string);
}
export declare class ForbiddenError extends ApplicationError {
    constructor(message?: string);
}
export declare class ConflictError extends ApplicationError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class InternalServerError extends ApplicationError {
    constructor(message: string, error?: Error);
}
export declare class DataIngestionError extends ApplicationError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class DataQualityError extends ApplicationError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class EncryptionError extends ApplicationError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map
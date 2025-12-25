/**
 * Schema Validation Utilities
 */
import { ValidationResult } from '../types/index';
export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: unknown[];
    items?: SchemaField;
    properties?: Record<string, SchemaField>;
}
export interface Schema {
    [key: string]: SchemaField;
}
export declare class SchemaValidator {
    private schema;
    constructor(schema: Schema);
    validate(data: unknown): ValidationResult;
    private validateField;
    private validateString;
    private validateNumber;
    private validateDate;
    private validateArray;
    private validateObject;
    private getType;
}
export declare const createValidator: (schema: Schema) => SchemaValidator;
//# sourceMappingURL=validation.d.ts.map
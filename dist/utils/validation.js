"use strict";
/**
 * Schema Validation Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidator = exports.SchemaValidator = void 0;
class SchemaValidator {
    constructor(schema) {
        this.schema = schema;
    }
    validate(data) {
        const errors = [];
        const warnings = [];
        if (typeof data !== 'object' || data === null) {
            errors.push({
                field: 'root',
                message: 'Data must be an object',
                code: 'INVALID_TYPE',
            });
            return { isValid: false, errors, warnings };
        }
        const obj = data;
        // Check for required fields
        for (const [fieldName, fieldSchema] of Object.entries(this.schema)) {
            if (fieldSchema.required && !(fieldName in obj)) {
                errors.push({
                    field: fieldName,
                    message: `Field ${fieldName} is required`,
                    code: 'REQUIRED_FIELD',
                });
            }
        }
        // Validate each field
        for (const [fieldName, value] of Object.entries(obj)) {
            if (fieldName in this.schema) {
                const fieldSchema = this.schema[fieldName];
                const fieldErrors = this.validateField(fieldName, value, fieldSchema);
                errors.push(...fieldErrors);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    validateField(fieldName, value, schema) {
        const errors = [];
        // Check type
        if (value !== null && value !== undefined) {
            const actualType = this.getType(value);
            if (actualType !== schema.type) {
                errors.push({
                    field: fieldName,
                    message: `Field ${fieldName} must be of type ${schema.type}, got ${actualType}`,
                    code: 'INVALID_TYPE',
                });
                return errors;
            }
            // Type-specific validation
            switch (schema.type) {
                case 'string':
                    errors.push(...this.validateString(fieldName, value, schema));
                    break;
                case 'number':
                    errors.push(...this.validateNumber(fieldName, value, schema));
                    break;
                case 'date':
                    errors.push(...this.validateDate(fieldName, value));
                    break;
                case 'array':
                    errors.push(...this.validateArray(fieldName, value, schema));
                    break;
                case 'object':
                    errors.push(...this.validateObject(fieldName, value, schema));
                    break;
            }
            // Check enum
            if (schema.enum && !schema.enum.includes(value)) {
                errors.push({
                    field: fieldName,
                    message: `Field ${fieldName} must be one of: ${schema.enum.join(', ')}`,
                    code: 'INVALID_VALUE',
                });
            }
        }
        return errors;
    }
    validateString(fieldName, value, schema) {
        const errors = [];
        if (schema.minLength !== undefined && value.length < schema.minLength) {
            errors.push({
                field: fieldName,
                message: `Field ${fieldName} must have at least ${schema.minLength} characters`,
                code: 'MIN_LENGTH',
            });
        }
        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
            errors.push({
                field: fieldName,
                message: `Field ${fieldName} must have at most ${schema.maxLength} characters`,
                code: 'MAX_LENGTH',
            });
        }
        if (schema.pattern && !schema.pattern.test(value)) {
            errors.push({
                field: fieldName,
                message: `Field ${fieldName} does not match the required pattern`,
                code: 'PATTERN_MISMATCH',
            });
        }
        return errors;
    }
    validateNumber(fieldName, value, schema) {
        const errors = [];
        if (schema.min !== undefined && value < schema.min) {
            errors.push({
                field: fieldName,
                message: `Field ${fieldName} must be at least ${schema.min}`,
                code: 'MIN_VALUE',
            });
        }
        if (schema.max !== undefined && value > schema.max) {
            errors.push({
                field: fieldName,
                message: `Field ${fieldName} must be at most ${schema.max}`,
                code: 'MAX_VALUE',
            });
        }
        return errors;
    }
    validateDate(fieldName, value) {
        const errors = [];
        if (!(value instanceof Date) || isNaN(value.getTime())) {
            errors.push({
                field: fieldName,
                message: `Field ${fieldName} must be a valid date`,
                code: 'INVALID_DATE',
            });
        }
        return errors;
    }
    validateArray(fieldName, value, schema) {
        const errors = [];
        if (schema.items) {
            for (let i = 0; i < value.length; i++) {
                const itemErrors = this.validateField(`${fieldName}[${i}]`, value[i], schema.items);
                errors.push(...itemErrors);
            }
        }
        return errors;
    }
    validateObject(fieldName, value, schema) {
        const errors = [];
        if (schema.properties) {
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
                if (propName in value) {
                    const propErrors = this.validateField(`${fieldName}.${propName}`, value[propName], propSchema);
                    errors.push(...propErrors);
                }
                else if (propSchema.required) {
                    errors.push({
                        field: `${fieldName}.${propName}`,
                        message: `Field ${fieldName}.${propName} is required`,
                        code: 'REQUIRED_FIELD',
                    });
                }
            }
        }
        return errors;
    }
    getType(value) {
        if (value === null)
            return 'null';
        if (value instanceof Date)
            return 'date';
        if (Array.isArray(value))
            return 'array';
        return typeof value;
    }
}
exports.SchemaValidator = SchemaValidator;
const createValidator = (schema) => {
    return new SchemaValidator(schema);
};
exports.createValidator = createValidator;
//# sourceMappingURL=validation.js.map
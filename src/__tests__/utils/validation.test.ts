/**
 * Property-Based Tests for Schema Validation
 * **Feature: clinical-trial-data-integration, Property 12: Schema Validation Completeness**
 * **Validates: Requirements 1.1, 1.4**
 */

import { SchemaValidator, Schema } from '../../utils/validation';

describe('SchemaValidator - Property 12: Schema Validation Completeness', () => {
  test('should accept valid data that passes all schema constraints', () => {
    // Arrange
    const schema: Schema = {
      patientId: { type: 'string', required: true, minLength: 1 },
      age: { type: 'number', required: true, min: 0, max: 150 },
      enrollmentDate: { type: 'date', required: true },
    };

    const validator = new SchemaValidator(schema);
    const validData = {
      patientId: 'P001',
      age: 45,
      enrollmentDate: new Date('2023-01-01'),
    };

    // Act
    const result = validator.validate(validData);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject data missing required fields', () => {
    // Arrange
    const schema: Schema = {
      patientId: { type: 'string', required: true },
      age: { type: 'number', required: true },
    };

    const validator = new SchemaValidator(schema);
    const invalidData = {
      patientId: 'P001',
      // age is missing
    };

    // Act
    const result = validator.validate(invalidData);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'age')).toBe(true);
  });

  test('should reject data with incorrect field types', () => {
    // Arrange
    const schema: Schema = {
      patientId: { type: 'string', required: true },
      age: { type: 'number', required: true },
    };

    const validator = new SchemaValidator(schema);
    const invalidData = {
      patientId: 'P001',
      age: 'forty-five', // should be number
    };

    // Act
    const result = validator.validate(invalidData);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'age' && e.code === 'INVALID_TYPE')).toBe(true);
  });

  test('should validate string length constraints', () => {
    // Arrange
    const schema: Schema = {
      patientId: { type: 'string', required: true, minLength: 3, maxLength: 10 },
    };

    const validator = new SchemaValidator(schema);

    // Act & Assert - too short
    let result = validator.validate({ patientId: 'P' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MIN_LENGTH')).toBe(true);

    // Act & Assert - too long
    result = validator.validate({ patientId: 'P0123456789ABC' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MAX_LENGTH')).toBe(true);

    // Act & Assert - valid
    result = validator.validate({ patientId: 'P001' });
    expect(result.isValid).toBe(true);
  });

  test('should validate number range constraints', () => {
    // Arrange
    const schema: Schema = {
      age: { type: 'number', required: true, min: 0, max: 150 },
    };

    const validator = new SchemaValidator(schema);

    // Act & Assert - too small
    let result = validator.validate({ age: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MIN_VALUE')).toBe(true);

    // Act & Assert - too large
    result = validator.validate({ age: 200 });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MAX_VALUE')).toBe(true);

    // Act & Assert - valid
    result = validator.validate({ age: 45 });
    expect(result.isValid).toBe(true);
  });

  test('should validate enum constraints', () => {
    // Arrange
    const schema: Schema = {
      gender: { type: 'string', required: true, enum: ['M', 'F', 'O', 'U'] },
    };

    const validator = new SchemaValidator(schema);

    // Act & Assert - invalid enum value
    let result = validator.validate({ gender: 'X' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_VALUE')).toBe(true);

    // Act & Assert - valid enum value
    result = validator.validate({ gender: 'M' });
    expect(result.isValid).toBe(true);
  });

  test('should validate pattern constraints', () => {
    // Arrange
    const schema: Schema = {
      email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    };

    const validator = new SchemaValidator(schema);

    // Act & Assert - invalid pattern
    let result = validator.validate({ email: 'invalid-email' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PATTERN_MISMATCH')).toBe(true);

    // Act & Assert - valid pattern
    result = validator.validate({ email: 'user@example.com' });
    expect(result.isValid).toBe(true);
  });

  test('should validate array items', () => {
    // Arrange
    const schema: Schema = {
      ids: {
        type: 'array',
        required: true,
        items: { type: 'string', required: true, minLength: 1 },
      },
    };

    const validator = new SchemaValidator(schema);

    // Act & Assert - valid array
    let result = validator.validate({ ids: ['P001', 'P002', 'P003'] });
    expect(result.isValid).toBe(true);

    // Act & Assert - invalid array item
    result = validator.validate({ ids: ['P001', '', 'P003'] });
    expect(result.isValid).toBe(false);
  });

  test('should validate nested objects', () => {
    // Arrange
    const schema: Schema = {
      demographics: {
        type: 'object',
        required: true,
        properties: {
          age: { type: 'number', required: true, min: 0, max: 150 },
          gender: { type: 'string', required: true },
        },
      },
    };

    const validator = new SchemaValidator(schema);

    // Act & Assert - valid nested object
    let result = validator.validate({
      demographics: { age: 45, gender: 'M' },
    });
    expect(result.isValid).toBe(true);

    // Act & Assert - invalid nested object
    result = validator.validate({
      demographics: { age: 200, gender: 'M' },
    });
    expect(result.isValid).toBe(false);
  });

  test('should preserve all required field information in validation result', () => {
    // Arrange
    const schema: Schema = {
      patientId: { type: 'string', required: true },
      age: { type: 'number', required: true },
      gender: { type: 'string', required: true },
    };

    const validator = new SchemaValidator(schema);
    const invalidData = {
      patientId: 'P001',
      // age and gender missing
    };

    // Act
    const result = validator.validate(invalidData);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.map((e) => e.field)).toContain('age');
    expect(result.errors.map((e) => e.field)).toContain('gender');
  });
});

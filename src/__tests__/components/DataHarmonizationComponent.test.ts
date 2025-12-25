/**
 * Property-Based Tests for Data Harmonization Component
 * **Feature: clinical-trial-data-integration, Property 2: Deduplication Idempotence**
 * **Validates: Requirements 1.2**
 */

import { DataHarmonizationComponent } from '../../components/DataHarmonizationComponent';

describe('DataHarmonizationComponent - Property 2: Deduplication Idempotence', () => {
  let component: DataHarmonizationComponent;

  beforeEach(() => {
    component = new DataHarmonizationComponent();
  });

  test('should produce same result when deduplication is applied multiple times', async () => {
    // Arrange
    const records = [
      { patientId: 'P001', name: 'John Doe', age: 45 },
      { patientId: 'P001', name: 'John Doe', age: 45 },
      { patientId: 'P002', name: 'Jane Smith', age: 38 },
      { patientId: 'P001', name: 'John Doe', age: 45 },
    ];

    const matchingRules = {
      patient: { fields: ['patientId', 'name'] },
    };

    // Act
    const result1 = await component.deduplicateRecords(records, matchingRules);
    const result2 = await component.deduplicateRecords(result1, matchingRules);
    const result3 = await component.deduplicateRecords(result2, matchingRules);

    // Assert
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
    expect(result1).toHaveLength(2);
  });

  test('should not create additional merged records when deduplication is repeated', async () => {
    // Arrange
    const records = [
      { patientId: 'P001', value: 'A' },
      { patientId: 'P001', value: 'A' },
      { patientId: 'P002', value: 'B' },
    ];

    const matchingRules = { patient: { fields: ['patientId'] } };

    // Act
    const result1 = await component.deduplicateRecords(records, matchingRules);
    const result2 = await component.deduplicateRecords(result1, matchingRules);

    // Assert
    expect(result1.length).toBe(result2.length);
    expect(result1).toEqual(result2);
  });

  test('should harmonize data consistently', async () => {
    // Arrange
    const data = {
      patientName: '  john doe  ',
      studyId: 'study001',
      status: 'active',
    };

    const rules = {
      patientName: 'trim',
      studyId: 'uppercase',
    };

    // Act
    const result1 = await component.harmonizeData(data, rules);
    const result2 = await component.harmonizeData(result1, rules);

    // Assert
    expect(result1).toEqual(result2);
  });

  test('should merge records consistently with same strategy', async () => {
    // Arrange
    const record1 = { patientId: 'P001', name: 'John', age: 45 };
    const record2 = { patientId: 'P001', name: 'John Doe', age: 45 };

    // Act
    const merged1 = await component.mergeRecords(record1, record2, 'most-complete');
    const merged2 = await component.mergeRecords(record1, record2, 'most-complete');

    // Assert
    expect(merged1).toEqual(merged2);
  });

  test('should preserve all records when no duplicates exist', async () => {
    // Arrange
    const records = [
      { patientId: 'P001', name: 'John' },
      { patientId: 'P002', name: 'Jane' },
      { patientId: 'P003', name: 'Bob' },
    ];

    const matchingRules = { patient: { fields: ['patientId'] } };

    // Act
    const result = await component.deduplicateRecords(records, matchingRules);

    // Assert
    expect(result).toHaveLength(3);
    expect(result).toEqual(records);
  });

  test('should handle empty records array', async () => {
    // Arrange
    const records: unknown[] = [];
    const matchingRules = {};

    // Act
    const result = await component.deduplicateRecords(records, matchingRules);

    // Assert
    expect(result).toEqual([]);
  });

  test('should maintain audit trail for transformations', async () => {
    // Arrange
    const records = [
      { patientId: 'P001', name: 'John' },
      { patientId: 'P001', name: 'John' },
    ];

    // Act
    await component.deduplicateRecords(records, {});
    const auditLog = component.getTransformationAuditLog();

    // Assert
    expect(auditLog).toHaveLength(1);
    expect(auditLog[0].operation).toBe('deduplicate');
    expect(auditLog[0].details.inputCount).toBe(2);
    expect(auditLog[0].details.outputCount).toBe(1);
  });
});

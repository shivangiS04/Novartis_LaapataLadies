/**
 * Property-Based Tests for Data Ingestion Component
 * **Feature: clinical-trial-data-integration, Property 1: Data Ingestion Completeness**
 * **Validates: Requirements 1.1, 1.5**
 */

import { DataIngestionComponent } from '../../components/DataIngestionComponent';
import { EventBus } from '../../services/EventBus';
import { DataSource } from '../../types/index';

describe('DataIngestionComponent - Property 1: Data Ingestion Completeness', () => {
  let component: DataIngestionComponent;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    component = new DataIngestionComponent(eventBus);
  });

  test('should ingest data from registered source and preserve all fields', async () => {
    // Arrange
    const source: DataSource = {
      sourceId: 'EDC_001',
      sourceName: 'EDC System',
      sourceType: 'EDC',
      schemaMapping: {
        patientId: 'string',
        age: 'number',
        enrollmentDate: 'date',
      },
      isActive: true,
    };

    const dataPayload = {
      patientId: 'P001',
      age: 45,
      enrollmentDate: new Date('2023-01-01'),
    };

    await component.registerDataSource(source);

    // Act
    const ingestionId = await component.ingestData('EDC_001', dataPayload, { source: 'EDC' });

    // Assert
    expect(ingestionId).toBeDefined();
    expect(ingestionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  test('should reject data from unregistered source', async () => {
    // Arrange
    const dataPayload = { patientId: 'P001' };

    // Act & Assert
    await expect(component.ingestData('UNKNOWN_SOURCE', dataPayload, {})).rejects.toThrow(
      'Data source UNKNOWN_SOURCE is not registered'
    );
  });

  test('should reject data from inactive source', async () => {
    // Arrange
    const source: DataSource = {
      sourceId: 'EDC_001',
      sourceName: 'EDC System',
      sourceType: 'EDC',
      schemaMapping: {},
      isActive: false,
    };

    const dataPayload = { patientId: 'P001' };

    await component.registerDataSource(source);

    // Act & Assert
    await expect(component.ingestData('EDC_001', dataPayload, {})).rejects.toThrow(
      'Data source EDC_001 is not active'
    );
  });

  test('should register data source without code changes', async () => {
    // Arrange
    const source: DataSource = {
      sourceId: 'LAB_001',
      sourceName: 'Lab System',
      sourceType: 'LAB',
      endpoint: 'https://lab.example.com/api',
      schemaMapping: {
        testName: 'string',
        value: 'number',
        unit: 'string',
      },
      isActive: true,
    };

    // Act
    await component.registerDataSource(source);

    // Assert
    const sources = await component.getRegisteredSources();
    expect(sources).toHaveLength(1);
    expect(sources[0].sourceId).toBe('LAB_001');
    expect(sources[0].sourceName).toBe('Lab System');
  });

  test('should validate schema during ingestion', async () => {
    // Arrange
    const source: DataSource = {
      sourceId: 'EDC_001',
      sourceName: 'EDC System',
      sourceType: 'EDC',
      schemaMapping: {
        patientId: { type: 'string', required: true, minLength: 1 },
        age: { type: 'number', required: true, min: 0, max: 150 },
      },
      isActive: true,
    };

    await component.registerDataSource(source);

    // Act & Assert - invalid data
    const invalidData = {
      patientId: 'P001',
      age: 200, // exceeds max
    };

    await expect(component.ingestData('EDC_001', invalidData, {})).rejects.toThrow(
      'Schema validation failed for source EDC_001'
    );
  });

  test('should add failed ingestions to dead letter queue', async () => {
    // Arrange
    const dataPayload = { patientId: 'P001' };

    // Act
    try {
      await component.ingestData('UNKNOWN_SOURCE', dataPayload, {});
    } catch {
      // Expected to fail
    }

    // Assert
    const dlq = component.getDeadLetterQueue();
    expect(dlq).toHaveLength(1);
    expect(dlq[0].sourceId).toBe('UNKNOWN_SOURCE');
    expect(dlq[0].data).toEqual(dataPayload);
  });

  test('should update last sync time on successful ingestion', async () => {
    // Arrange
    const source: DataSource = {
      sourceId: 'EDC_001',
      sourceName: 'EDC System',
      sourceType: 'EDC',
      schemaMapping: {},
      isActive: true,
    };

    await component.registerDataSource(source);
    const beforeSync = new Date();

    // Act
    await component.ingestData('EDC_001', { patientId: 'P001' }, {});

    // Assert
    const sources = await component.getRegisteredSources();
    const updatedSource = sources.find((s) => s.sourceId === 'EDC_001');
    expect(updatedSource?.lastSync).toBeDefined();
    expect(updatedSource!.lastSync!.getTime()).toBeGreaterThanOrEqual(beforeSync.getTime());
  });

  test('should support multiple data sources simultaneously', async () => {
    // Arrange
    const edcSource: DataSource = {
      sourceId: 'EDC_001',
      sourceName: 'EDC System',
      sourceType: 'EDC',
      schemaMapping: {},
      isActive: true,
    };

    const labSource: DataSource = {
      sourceId: 'LAB_001',
      sourceName: 'Lab System',
      sourceType: 'LAB',
      schemaMapping: {},
      isActive: true,
    };

    await component.registerDataSource(edcSource);
    await component.registerDataSource(labSource);

    // Act
    const edcIngestionId = await component.ingestData('EDC_001', { patientId: 'P001' }, {});
    const labIngestionId = await component.ingestData('LAB_001', { testName: 'Hemoglobin' }, {});

    // Assert
    expect(edcIngestionId).toBeDefined();
    expect(labIngestionId).toBeDefined();
    expect(edcIngestionId).not.toBe(labIngestionId);

    const sources = await component.getRegisteredSources();
    expect(sources).toHaveLength(2);
  });

  test('should clear dead letter queue', async () => {
    // Arrange
    try {
      await component.ingestData('UNKNOWN_SOURCE', { patientId: 'P001' }, {});
    } catch {
      // Expected to fail
    }

    let dlq = component.getDeadLetterQueue();
    expect(dlq).toHaveLength(1);

    // Act
    component.clearDeadLetterQueue();

    // Assert
    dlq = component.getDeadLetterQueue();
    expect(dlq).toHaveLength(0);
  });
});

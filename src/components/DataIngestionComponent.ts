/**
 * Data Ingestion Component
 * Handles ingestion of data from multiple sources
 */

import { v4 as uuidv4 } from 'uuid';
import { IDataIngestionComponent, IEventBus, ILogger } from '../interfaces/components';
import { DataSource, ValidationResult } from '../types/index';
import { SchemaValidator, Schema } from '../utils/validation';
import { DataIngestionError } from '../utils/errors';
import { createLogger } from '../utils/logger';

export class DataIngestionComponent implements IDataIngestionComponent {
  private registeredSources: Map<string, DataSource> = new Map();
  private schemaValidators: Map<string, SchemaValidator> = new Map();
  private eventBus: IEventBus;
  private logger: ILogger;
  private deadLetterQueue: Array<{ sourceId: string; data: unknown; error: string; timestamp: Date }> = [];

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
    this.logger = createLogger('DataIngestionComponent');
  }

  async ingestData(sourceId: string, dataPayload: unknown, metadata: Record<string, unknown>): Promise<string> {
    try {
      this.logger.info(`Ingesting data from source: ${sourceId}`, { metadata });

      // Validate source is registered
      const source = this.registeredSources.get(sourceId);
      if (!source) {
        throw new DataIngestionError(`Data source ${sourceId} is not registered`, { sourceId });
      }

      if (!source.isActive) {
        throw new DataIngestionError(`Data source ${sourceId} is not active`, { sourceId });
      }

      // Validate schema
      const validator = this.schemaValidators.get(sourceId);
      if (validator) {
        const validationResult = validator.validate(dataPayload);
        if (!validationResult.isValid) {
          throw new DataIngestionError(`Schema validation failed for source ${sourceId}`, {
            sourceId,
            errors: validationResult.errors,
          });
        }
      }

      // Generate ingestion ID
      const ingestionId = uuidv4();

      // Publish ingestion event
      await this.eventBus.publish('data.ingested', {
        ingestionId,
        sourceId,
        dataPayload,
        metadata,
        timestamp: new Date(),
      });

      // Update last sync time
      source.lastSync = new Date();

      this.logger.info(`Data ingested successfully`, { ingestionId, sourceId });
      return ingestionId;
    } catch (error) {
      this.logger.error(`Data ingestion failed for source ${sourceId}`, error as Error, { sourceId, dataPayload: dataPayload });

      // Add to dead letter queue
      this.deadLetterQueue.push({
        sourceId,
        data: dataPayload,
        error: (error as Error).message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  async registerDataSource(sourceConfig: DataSource): Promise<void> {
    try {
      this.logger.info(`Registering data source: ${sourceConfig.sourceId}`, { sourceConfig });

      // Validate source config
      if (!sourceConfig.sourceId || sourceConfig.sourceId.trim() === '') {
        throw new DataIngestionError('Source ID is required', { sourceConfig });
      }

      if (!sourceConfig.sourceName || sourceConfig.sourceName.trim() === '') {
        throw new DataIngestionError('Source name is required', { sourceConfig });
      }

      // Register source
      this.registeredSources.set(sourceConfig.sourceId, sourceConfig);

      // Create schema validator if schema mapping is provided
      if (sourceConfig.schemaMapping && Object.keys(sourceConfig.schemaMapping).length > 0) {
        const schema = this.convertMappingToSchema(sourceConfig.schemaMapping);
        this.schemaValidators.set(sourceConfig.sourceId, new SchemaValidator(schema));
      }

      this.logger.info(`Data source registered successfully`, { sourceId: sourceConfig.sourceId });
    } catch (error) {
      this.logger.error(`Failed to register data source`, error as Error, { sourceConfig });
      throw error;
    }
  }

  async validateSchema(data: unknown, schema: Record<string, unknown>): Promise<ValidationResult> {
    try {
      const schemaObj = this.convertMappingToSchema(schema);
      const validator = new SchemaValidator(schemaObj);
      return validator.validate(data);
    } catch (error) {
      this.logger.error(`Schema validation error`, error as Error);
      throw error;
    }
  }

  async getRegisteredSources(): Promise<DataSource[]> {
    return Array.from(this.registeredSources.values());
  }

  getDeadLetterQueue(): Array<{ sourceId: string; data: unknown; error: string; timestamp: Date }> {
    return [...this.deadLetterQueue];
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  private convertMappingToSchema(mapping: Record<string, unknown>): Schema {
    const schema: Schema = {};

    for (const [key, value] of Object.entries(mapping)) {
      if (typeof value === 'string') {
        // Simple type mapping
        schema[key] = {
          type: this.parseType(value),
          required: true,
        };
      } else if (typeof value === 'object' && value !== null) {
        // Complex type mapping
        const config = value as Record<string, unknown>;
        schema[key] = {
          type: this.parseType(config.type as string),
          required: config.required !== false,
          minLength: config.minLength as number | undefined,
          maxLength: config.maxLength as number | undefined,
          min: config.min as number | undefined,
          max: config.max as number | undefined,
          enum: config.enum as unknown[] | undefined,
        };
      }
    }

    return schema;
  }

  private parseType(typeStr: string): 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' {
    const typeMap: Record<string, 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'> = {
      string: 'string',
      number: 'number',
      int: 'number',
      integer: 'number',
      float: 'number',
      boolean: 'boolean',
      bool: 'boolean',
      date: 'date',
      datetime: 'date',
      array: 'array',
      object: 'object',
    };

    return typeMap[typeStr.toLowerCase()] || 'string';
  }
}

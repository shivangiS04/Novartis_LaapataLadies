"use strict";
/**
 * Data Ingestion Component
 * Handles ingestion of data from multiple sources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIngestionComponent = void 0;
const uuid_1 = require("uuid");
const validation_1 = require("../utils/validation");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class DataIngestionComponent {
    constructor(eventBus) {
        this.registeredSources = new Map();
        this.schemaValidators = new Map();
        this.deadLetterQueue = [];
        this.eventBus = eventBus;
        this.logger = (0, logger_1.createLogger)('DataIngestionComponent');
    }
    async ingestData(sourceId, dataPayload, metadata) {
        try {
            this.logger.info(`Ingesting data from source: ${sourceId}`, { metadata });
            // Validate source is registered
            const source = this.registeredSources.get(sourceId);
            if (!source) {
                throw new errors_1.DataIngestionError(`Data source ${sourceId} is not registered`, { sourceId });
            }
            if (!source.isActive) {
                throw new errors_1.DataIngestionError(`Data source ${sourceId} is not active`, { sourceId });
            }
            // Validate schema
            const validator = this.schemaValidators.get(sourceId);
            if (validator) {
                const validationResult = validator.validate(dataPayload);
                if (!validationResult.isValid) {
                    throw new errors_1.DataIngestionError(`Schema validation failed for source ${sourceId}`, {
                        sourceId,
                        errors: validationResult.errors,
                    });
                }
            }
            // Generate ingestion ID
            const ingestionId = (0, uuid_1.v4)();
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
        }
        catch (error) {
            this.logger.error(`Data ingestion failed for source ${sourceId}`, error, { sourceId, dataPayload: dataPayload });
            // Add to dead letter queue
            this.deadLetterQueue.push({
                sourceId,
                data: dataPayload,
                error: error.message,
                timestamp: new Date(),
            });
            throw error;
        }
    }
    async registerDataSource(sourceConfig) {
        try {
            this.logger.info(`Registering data source: ${sourceConfig.sourceId}`, { sourceConfig });
            // Validate source config
            if (!sourceConfig.sourceId || sourceConfig.sourceId.trim() === '') {
                throw new errors_1.DataIngestionError('Source ID is required', { sourceConfig });
            }
            if (!sourceConfig.sourceName || sourceConfig.sourceName.trim() === '') {
                throw new errors_1.DataIngestionError('Source name is required', { sourceConfig });
            }
            // Register source
            this.registeredSources.set(sourceConfig.sourceId, sourceConfig);
            // Create schema validator if schema mapping is provided
            if (sourceConfig.schemaMapping && Object.keys(sourceConfig.schemaMapping).length > 0) {
                const schema = this.convertMappingToSchema(sourceConfig.schemaMapping);
                this.schemaValidators.set(sourceConfig.sourceId, new validation_1.SchemaValidator(schema));
            }
            this.logger.info(`Data source registered successfully`, { sourceId: sourceConfig.sourceId });
        }
        catch (error) {
            this.logger.error(`Failed to register data source`, error, { sourceConfig });
            throw error;
        }
    }
    async validateSchema(data, schema) {
        try {
            const schemaObj = this.convertMappingToSchema(schema);
            const validator = new validation_1.SchemaValidator(schemaObj);
            return validator.validate(data);
        }
        catch (error) {
            this.logger.error(`Schema validation error`, error);
            throw error;
        }
    }
    async getRegisteredSources() {
        return Array.from(this.registeredSources.values());
    }
    getDeadLetterQueue() {
        return [...this.deadLetterQueue];
    }
    clearDeadLetterQueue() {
        this.deadLetterQueue = [];
    }
    convertMappingToSchema(mapping) {
        const schema = {};
        for (const [key, value] of Object.entries(mapping)) {
            if (typeof value === 'string') {
                // Simple type mapping
                schema[key] = {
                    type: this.parseType(value),
                    required: true,
                };
            }
            else if (typeof value === 'object' && value !== null) {
                // Complex type mapping
                const config = value;
                schema[key] = {
                    type: this.parseType(config.type),
                    required: config.required !== false,
                    minLength: config.minLength,
                    maxLength: config.maxLength,
                    min: config.min,
                    max: config.max,
                    enum: config.enum,
                };
            }
        }
        return schema;
    }
    parseType(typeStr) {
        const typeMap = {
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
exports.DataIngestionComponent = DataIngestionComponent;
//# sourceMappingURL=DataIngestionComponent.js.map
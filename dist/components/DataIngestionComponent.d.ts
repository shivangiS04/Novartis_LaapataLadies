/**
 * Data Ingestion Component
 * Handles ingestion of data from multiple sources
 */
import { IDataIngestionComponent, IEventBus } from '../interfaces/components';
import { DataSource, ValidationResult } from '../types/index';
export declare class DataIngestionComponent implements IDataIngestionComponent {
    private registeredSources;
    private schemaValidators;
    private eventBus;
    private logger;
    private deadLetterQueue;
    constructor(eventBus: IEventBus);
    ingestData(sourceId: string, dataPayload: unknown, metadata: Record<string, unknown>): Promise<string>;
    registerDataSource(sourceConfig: DataSource): Promise<void>;
    validateSchema(data: unknown, schema: Record<string, unknown>): Promise<ValidationResult>;
    getRegisteredSources(): Promise<DataSource[]>;
    getDeadLetterQueue(): Array<{
        sourceId: string;
        data: unknown;
        error: string;
        timestamp: Date;
    }>;
    clearDeadLetterQueue(): void;
    private convertMappingToSchema;
    private parseType;
}
//# sourceMappingURL=DataIngestionComponent.d.ts.map
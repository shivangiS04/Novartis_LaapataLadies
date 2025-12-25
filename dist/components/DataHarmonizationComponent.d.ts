/**
 * Data Harmonization Component
 * Handles deduplication and merging of data from multiple sources
 */
import { IDataHarmonizationComponent } from '../interfaces/components';
export declare class DataHarmonizationComponent implements IDataHarmonizationComponent {
    private logger;
    private deduplicationRules;
    private transformationAuditLog;
    constructor();
    harmonizeData(rawData: unknown, harmonizationRules: Record<string, unknown>): Promise<unknown>;
    deduplicateRecords(records: unknown[], matchingRules: Record<string, unknown>): Promise<unknown[]>;
    mergeRecords(record1: unknown, record2: unknown, mergeStrategy: string): Promise<unknown>;
    getHarmonizationRules(): Promise<Record<string, unknown>>;
    getTransformationAuditLog(): Array<{
        timestamp: Date;
        operation: string;
        details: Record<string, unknown>;
    }>;
    private applyRule;
    private generateFingerprint;
    private resolveConflict;
    private getMostComplete;
}
//# sourceMappingURL=DataHarmonizationComponent.d.ts.map
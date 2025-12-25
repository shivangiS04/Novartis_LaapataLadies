/**
 * Data Quality Monitoring Component
 */
import { IDataQualityComponent, IEventBus } from '../interfaces/components';
import { DataQualityIssue, Alert, PaginationParams, PaginatedResponse } from '../types/index';
export declare class DataQualityComponent implements IDataQualityComponent {
    private eventBus;
    private qualityIssues;
    private alerts;
    private qualityRules;
    constructor(eventBus: IEventBus);
    validateDataQuality(data: unknown, rules: Record<string, unknown>): Promise<DataQualityIssue[]>;
    detectAnomalies(data: unknown, historicalPatterns: unknown[]): Promise<DataQualityIssue[]>;
    generateAlert(issue: DataQualityIssue, severity: string, stakeholders: string[]): Promise<Alert>;
    trackResolution(alertId: string, resolution: string): Promise<void>;
    getQualityMetrics(params: PaginationParams): Promise<PaginatedResponse<DataQualityIssue>>;
    private initializeDefaultRules;
}
//# sourceMappingURL=DataQualityComponent.d.ts.map
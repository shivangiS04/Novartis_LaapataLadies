/**
 * Data Quality Issue Model
 */
import { DataQualityIssue, DataQualityIssueType, SeverityLevel } from '../types/index';
import { ValidationResult } from '../types/index';
export declare class DataQualityIssueModel implements DataQualityIssue {
    issueId: string;
    recordId: string;
    issueType: DataQualityIssueType;
    severity: SeverityLevel;
    description: string;
    affectedField: string;
    detectedDate: Date;
    resolvedDate?: Date;
    resolution?: string;
    resolutionTime?: number;
    constructor(data: Partial<DataQualityIssue>);
    validate(): ValidationResult;
    resolve(resolution: string): void;
    isResolved(): boolean;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=DataQualityIssue.d.ts.map
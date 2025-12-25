/**
 * Alert Model
 */
import { Alert, SeverityLevel, AlertStatus } from '../types/index';
import { ValidationResult } from '../types/index';
export declare class AlertModel implements Alert {
    alertId: string;
    type: string;
    severity: SeverityLevel;
    title: string;
    description: string;
    affectedRecords: string[];
    relatedIssues: string[];
    assignedTo: string[];
    status: AlertStatus;
    createdDate: Date;
    resolvedDate?: Date;
    resolutionNotes?: string;
    constructor(data: Partial<Alert>);
    validate(): ValidationResult;
    acknowledge(): void;
    resolve(notes: string): void;
    close(): void;
    isOpen(): boolean;
    isResolved(): boolean;
    addAffectedRecord(recordId: string): void;
    addRelatedIssue(issueId: string): void;
    assignTo(userId: string): void;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Alert.d.ts.map
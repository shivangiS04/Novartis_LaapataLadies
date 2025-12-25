/**
 * Lab Metrics Component
 * Tracks lab-specific data quality metrics
 */
import { LabResult } from '../types/index';
export interface LabMetrics {
    labResultId: string;
    testName: string;
    labName: string;
    hasMissingLabName: boolean;
    hasMissingReferenceRange: boolean;
    hasMissingUnit: boolean;
    isReconciled: boolean;
    qualityScore: number;
}
export interface LabReconciliationReport {
    totalLabResults: number;
    resultsWithMissingLabName: number;
    resultsWithMissingRanges: number;
    resultsWithMissingUnits: number;
    reconciliationPercentage: number;
    criticalIssues: LabMetrics[];
}
export declare class LabMetricsComponent {
    private logger;
    constructor();
    /**
     * Evaluate lab result quality
     */
    evaluateLabResult(labResult: LabResult): LabMetrics;
    /**
     * Generate lab reconciliation report
     */
    generateLabReconciliationReport(labResults: LabResult[]): LabReconciliationReport;
    /**
     * Track missing lab names
     */
    trackMissingLabNames(labResults: LabResult[]): LabResult[];
    /**
     * Track missing reference ranges
     */
    trackMissingRanges(labResults: LabResult[]): LabResult[];
    /**
     * Track missing units
     */
    trackMissingUnits(labResults: LabResult[]): LabResult[];
    /**
     * Get lab quality summary by test name
     */
    getLabQualitySummaryByTest(labResults: LabResult[]): Record<string, {
        total: number;
        quality: number;
    }>;
}
//# sourceMappingURL=LabMetricsComponent.d.ts.map
/**
 * Readiness Check Component
 * Automated readiness checks for interim analysis and submission
 */
import { Patient } from '../types/index';
export interface ReadinessCriteria {
    minDataQualityIndex: number;
    minDataCompleteness: number;
    maxOpenQueries: number;
    maxCriticalIssues: number;
    requiredVerificationPercentage: number;
}
export interface ReadinessCheckResult {
    checkType: 'interim_analysis' | 'submission';
    isReady: boolean;
    overallScore: number;
    criteria: ReadinessCriteriaResult[];
    issues: ReadinessIssue[];
    recommendations: string[];
    checkedDate: Date;
}
export interface ReadinessCriteriaResult {
    criteriaName: string;
    required: number | string;
    actual: number | string;
    isMet: boolean;
    severity: 'critical' | 'high' | 'warning' | 'info';
}
export interface ReadinessIssue {
    issueId: string;
    category: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedCount: number;
    recommendation: string;
}
export declare class ReadinessCheckComponent {
    private logger;
    private interimAnalysisCriteria;
    private submissionCriteria;
    constructor();
    /**
     * Check readiness for interim analysis
     */
    checkInterimAnalysisReadiness(patients: Patient[], metrics: Record<string, number>): ReadinessCheckResult;
    /**
     * Check readiness for submission
     */
    checkSubmissionReadiness(patients: Patient[], metrics: Record<string, number>): ReadinessCheckResult;
    /**
     * Perform readiness check with given criteria
     */
    private performReadinessCheck;
    /**
     * Calculate data completeness
     */
    private calculateDataCompleteness;
    /**
     * Count open queries
     */
    private countOpenQueries;
    /**
     * Count critical issues
     */
    private countCriticalIssues;
    /**
     * Calculate verification percentage
     */
    private calculateVerificationPercentage;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Set custom criteria
     */
    setInterimAnalysisCriteria(criteria: Partial<ReadinessCriteria>): void;
    /**
     * Set custom submission criteria
     */
    setSubmissionCriteria(criteria: Partial<ReadinessCriteria>): void;
}
//# sourceMappingURL=ReadinessCheckComponent.d.ts.map
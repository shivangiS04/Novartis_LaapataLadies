/**
 * Metrics Calculation Engine
 * Implements derived metrics for clinical trial data quality and operational tracking
 */
import { Patient } from '../types/index';
export interface DerivedMetrics {
    missingVisitPercentage: number;
    missingPagePercentage: number;
    cleanCRFPercentage: number;
    nonConformantDataPercentage: number;
    verificationStatusPercentage: number;
    cleanPatientStatus: boolean;
    dataQualityIndex: number;
}
export interface SiteMetrics {
    siteId: string;
    totalPatients: number;
    averageMissingVisitPercentage: number;
    averageCleanCRFPercentage: number;
    averageDataQualityIndex: number;
    performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
}
export interface TrialMetrics {
    studyId: string;
    totalPatients: number;
    totalSites: number;
    overallDataQualityIndex: number;
    readinessForInterimAnalysis: boolean;
    readinessForSubmission: boolean;
}
export declare class MetricsCalculationEngine {
    private logger;
    constructor();
    /**
     * Calculate derived metrics for a patient
     */
    calculatePatientMetrics(patient: Patient, expectedVisits: number): DerivedMetrics;
    /**
     * Calculate Data Quality Index with weighted scoring
     */
    private calculateDataQualityIndex;
    /**
     * Calculate site-level metrics
     */
    calculateSiteMetrics(patients: Patient[], siteId: string, expectedVisitsPerPatient: number): SiteMetrics;
    /**
     * Calculate trial-level metrics
     */
    calculateTrialMetrics(patients: Patient[], studyId: string, siteCount: number, expectedVisitsPerPatient: number): TrialMetrics;
    /**
     * Check data completeness threshold
     */
    private checkDataCompleteness;
    /**
     * Get performance rating based on DQI
     */
    private getPerformanceRating;
    /**
     * Identify underperforming sites
     */
    identifyUnderperformingSites(siteMetrics: SiteMetrics[], threshold?: number): SiteMetrics[];
    /**
     * Calculate deviation metrics
     */
    calculateDeviationMetrics(patients: Patient[]): Record<string, number>;
}
//# sourceMappingURL=MetricsCalculationEngine.d.ts.map
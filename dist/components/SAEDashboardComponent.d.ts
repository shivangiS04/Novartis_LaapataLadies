/**
 * SAE Dashboard Component
 * Tracks Serious Adverse Event metrics and discrepancies
 */
import { AdverseEvent, SeverityLevel } from '../types/index';
export type SAEReviewStatus = 'pending_dm' | 'pending_safety' | 'reconciled' | 'discrepancy';
export interface SAERecord {
    saeId: string;
    eventId: string;
    patientId: string;
    eventType: string;
    severity: SeverityLevel;
    onsetDate: Date;
    dmReviewStatus: SAEReviewStatus;
    safetyReviewStatus: SAEReviewStatus;
    discrepancies: SAEDiscrepancy[];
    reconciliationDate?: Date;
    createdDate: Date;
    lastUpdated: Date;
}
export interface SAEDiscrepancy {
    discrepancyId: string;
    saeId: string;
    field: string;
    dmValue: string;
    safetyValue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'resolved' | 'closed';
    createdDate: Date;
    resolvedDate?: Date;
}
export interface SAEMetrics {
    totalSAEs: number;
    pendingDMReview: number;
    pendingSafetyReview: number;
    reconciledSAEs: number;
    discrepancySAEs: number;
    reconciliationPercentage: number;
    averageReconciliationTime: number;
}
export declare class SAEDashboardComponent {
    private logger;
    private saeRecords;
    private discrepancies;
    constructor();
    /**
     * Create SAE record
     */
    createSAERecord(event: AdverseEvent): SAERecord;
    /**
     * Update DM review status
     */
    updateDMReviewStatus(saeId: string, status: SAEReviewStatus): SAERecord;
    /**
     * Update Safety review status
     */
    updateSafetyReviewStatus(saeId: string, status: SAEReviewStatus): SAERecord;
    /**
     * Create SAE discrepancy
     */
    createDiscrepancy(saeId: string, field: string, dmValue: string, safetyValue: string, severity: 'critical' | 'high' | 'medium' | 'low'): SAEDiscrepancy;
    /**
     * Resolve discrepancy
     */
    resolveDiscrepancy(discrepancyId: string, resolution: string): SAEDiscrepancy;
    /**
     * Get SAE metrics
     */
    getSAEMetrics(): SAEMetrics;
    /**
     * Get open discrepancies
     */
    getOpenDiscrepancies(saeId?: string): SAEDiscrepancy[];
    /**
     * Get critical discrepancies
     */
    getCriticalDiscrepancies(): SAEDiscrepancy[];
    /**
     * Get SAE by patient
     */
    getSAEByPatient(patientId: string): SAERecord[];
}
//# sourceMappingURL=SAEDashboardComponent.d.ts.map
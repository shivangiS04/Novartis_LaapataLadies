"use strict";
/**
 * SAE Dashboard Component
 * Tracks Serious Adverse Event metrics and discrepancies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAEDashboardComponent = void 0;
const logger_1 = require("../utils/logger");
class SAEDashboardComponent {
    constructor() {
        this.saeRecords = new Map();
        this.discrepancies = new Map();
        this.logger = (0, logger_1.createLogger)('SAEDashboardComponent');
    }
    /**
     * Create SAE record
     */
    createSAERecord(event) {
        try {
            const saeId = `sae_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const record = {
                saeId,
                eventId: event.eventId,
                patientId: event.patientId,
                eventType: event.eventType,
                severity: event.severity,
                onsetDate: event.onsetDate,
                dmReviewStatus: 'pending_dm',
                safetyReviewStatus: 'pending_safety',
                discrepancies: [],
                createdDate: new Date(),
                lastUpdated: new Date(),
            };
            this.saeRecords.set(saeId, record);
            this.logger.info(`SAE record created: ${saeId}`);
            return record;
        }
        catch (error) {
            this.logger.error('SAE record creation failed', error);
            throw error;
        }
    }
    /**
     * Update DM review status
     */
    updateDMReviewStatus(saeId, status) {
        try {
            const record = this.saeRecords.get(saeId);
            if (!record) {
                throw new Error(`SAE record not found: ${saeId}`);
            }
            record.dmReviewStatus = status;
            record.lastUpdated = new Date();
            if (status === 'reconciled' && record.safetyReviewStatus === 'reconciled') {
                record.reconciliationDate = new Date();
            }
            this.saeRecords.set(saeId, record);
            this.logger.info(`DM review status updated: ${saeId} -> ${status}`);
            return record;
        }
        catch (error) {
            this.logger.error('DM review status update failed', error);
            throw error;
        }
    }
    /**
     * Update Safety review status
     */
    updateSafetyReviewStatus(saeId, status) {
        try {
            const record = this.saeRecords.get(saeId);
            if (!record) {
                throw new Error(`SAE record not found: ${saeId}`);
            }
            record.safetyReviewStatus = status;
            record.lastUpdated = new Date();
            if (status === 'reconciled' && record.dmReviewStatus === 'reconciled') {
                record.reconciliationDate = new Date();
            }
            this.saeRecords.set(saeId, record);
            this.logger.info(`Safety review status updated: ${saeId} -> ${status}`);
            return record;
        }
        catch (error) {
            this.logger.error('Safety review status update failed', error);
            throw error;
        }
    }
    /**
     * Create SAE discrepancy
     */
    createDiscrepancy(saeId, field, dmValue, safetyValue, severity) {
        try {
            const record = this.saeRecords.get(saeId);
            if (!record) {
                throw new Error(`SAE record not found: ${saeId}`);
            }
            const discrepancyId = `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const discrepancy = {
                discrepancyId,
                saeId,
                field,
                dmValue,
                safetyValue,
                severity,
                status: 'open',
                createdDate: new Date(),
            };
            this.discrepancies.set(discrepancyId, discrepancy);
            record.discrepancies.push(discrepancy);
            record.dmReviewStatus = 'discrepancy';
            record.safetyReviewStatus = 'discrepancy';
            record.lastUpdated = new Date();
            this.saeRecords.set(saeId, record);
            this.logger.info(`SAE discrepancy created: ${discrepancyId}`);
            return discrepancy;
        }
        catch (error) {
            this.logger.error('SAE discrepancy creation failed', error);
            throw error;
        }
    }
    /**
     * Resolve discrepancy
     */
    resolveDiscrepancy(discrepancyId, resolution) {
        try {
            const discrepancy = this.discrepancies.get(discrepancyId);
            if (!discrepancy) {
                throw new Error(`Discrepancy not found: ${discrepancyId}`);
            }
            discrepancy.status = 'resolved';
            discrepancy.resolvedDate = new Date();
            this.discrepancies.set(discrepancyId, discrepancy);
            this.logger.info(`Discrepancy resolved: ${discrepancyId}`);
            return discrepancy;
        }
        catch (error) {
            this.logger.error('Discrepancy resolution failed', error);
            throw error;
        }
    }
    /**
     * Get SAE metrics
     */
    getSAEMetrics() {
        try {
            const records = Array.from(this.saeRecords.values());
            if (records.length === 0) {
                return {
                    totalSAEs: 0,
                    pendingDMReview: 0,
                    pendingSafetyReview: 0,
                    reconciledSAEs: 0,
                    discrepancySAEs: 0,
                    reconciliationPercentage: 0,
                    averageReconciliationTime: 0,
                };
            }
            const pendingDMReview = records.filter((r) => r.dmReviewStatus === 'pending_dm').length;
            const pendingSafetyReview = records.filter((r) => r.safetyReviewStatus === 'pending_safety').length;
            const reconciledSAEs = records.filter((r) => r.dmReviewStatus === 'reconciled' && r.safetyReviewStatus === 'reconciled').length;
            const discrepancySAEs = records.filter((r) => r.discrepancies.length > 0).length;
            const reconciliationPercentage = (reconciledSAEs / records.length) * 100;
            // Calculate average reconciliation time
            const reconciledRecords = records.filter((r) => r.reconciliationDate);
            const averageReconciliationTime = reconciledRecords.length > 0
                ? reconciledRecords.reduce((sum, r) => {
                    const time = (r.reconciliationDate.getTime() - r.createdDate.getTime()) / (1000 * 60 * 60 * 24); // days
                    return sum + time;
                }, 0) / reconciledRecords.length
                : 0;
            return {
                totalSAEs: records.length,
                pendingDMReview,
                pendingSafetyReview,
                reconciledSAEs,
                discrepancySAEs,
                reconciliationPercentage: Math.round(reconciliationPercentage * 100) / 100,
                averageReconciliationTime: Math.round(averageReconciliationTime * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error('SAE metrics calculation failed', error);
            throw error;
        }
    }
    /**
     * Get open discrepancies
     */
    getOpenDiscrepancies(saeId) {
        try {
            let discrepancies = Array.from(this.discrepancies.values()).filter((d) => d.status === 'open');
            if (saeId) {
                discrepancies = discrepancies.filter((d) => d.saeId === saeId);
            }
            return discrepancies;
        }
        catch (error) {
            this.logger.error('Open discrepancies retrieval failed', error);
            throw error;
        }
    }
    /**
     * Get critical discrepancies
     */
    getCriticalDiscrepancies() {
        try {
            return Array.from(this.discrepancies.values()).filter((d) => d.severity === 'critical' && d.status === 'open');
        }
        catch (error) {
            this.logger.error('Critical discrepancies retrieval failed', error);
            throw error;
        }
    }
    /**
     * Get SAE by patient
     */
    getSAEByPatient(patientId) {
        try {
            return Array.from(this.saeRecords.values()).filter((r) => r.patientId === patientId);
        }
        catch (error) {
            this.logger.error('SAE retrieval by patient failed', error);
            throw error;
        }
    }
}
exports.SAEDashboardComponent = SAEDashboardComponent;
//# sourceMappingURL=SAEDashboardComponent.js.map
/**
 * SAE Dashboard Component
 * Tracks Serious Adverse Event metrics and discrepancies
 */

import { ILogger } from '../interfaces/components';
import { createLogger } from '../utils/logger';
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

export class SAEDashboardComponent {
  private logger: ILogger;
  private saeRecords: Map<string, SAERecord> = new Map();
  private discrepancies: Map<string, SAEDiscrepancy> = new Map();

  constructor() {
    this.logger = createLogger('SAEDashboardComponent');
  }

  /**
   * Create SAE record
   */
  createSAERecord(event: AdverseEvent): SAERecord {
    try {
      const saeId = `sae_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const record: SAERecord = {
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
    } catch (error) {
      this.logger.error('SAE record creation failed', error as Error);
      throw error;
    }
  }

  /**
   * Update DM review status
   */
  updateDMReviewStatus(saeId: string, status: SAEReviewStatus): SAERecord {
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
    } catch (error) {
      this.logger.error('DM review status update failed', error as Error);
      throw error;
    }
  }

  /**
   * Update Safety review status
   */
  updateSafetyReviewStatus(saeId: string, status: SAEReviewStatus): SAERecord {
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
    } catch (error) {
      this.logger.error('Safety review status update failed', error as Error);
      throw error;
    }
  }

  /**
   * Create SAE discrepancy
   */
  createDiscrepancy(
    saeId: string,
    field: string,
    dmValue: string,
    safetyValue: string,
    severity: 'critical' | 'high' | 'medium' | 'low'
  ): SAEDiscrepancy {
    try {
      const record = this.saeRecords.get(saeId);
      if (!record) {
        throw new Error(`SAE record not found: ${saeId}`);
      }

      const discrepancyId = `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const discrepancy: SAEDiscrepancy = {
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
    } catch (error) {
      this.logger.error('SAE discrepancy creation failed', error as Error);
      throw error;
    }
  }

  /**
   * Resolve discrepancy
   */
  resolveDiscrepancy(discrepancyId: string, resolution: string): SAEDiscrepancy {
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
    } catch (error) {
      this.logger.error('Discrepancy resolution failed', error as Error);
      throw error;
    }
  }

  /**
   * Get SAE metrics
   */
  getSAEMetrics(): SAEMetrics {
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
      const reconciledSAEs = records.filter(
        (r) => r.dmReviewStatus === 'reconciled' && r.safetyReviewStatus === 'reconciled'
      ).length;
      const discrepancySAEs = records.filter((r) => r.discrepancies.length > 0).length;

      const reconciliationPercentage = (reconciledSAEs / records.length) * 100;

      // Calculate average reconciliation time
      const reconciledRecords = records.filter((r) => r.reconciliationDate);
      const averageReconciliationTime =
        reconciledRecords.length > 0
          ? reconciledRecords.reduce((sum, r) => {
              const time = (r.reconciliationDate!.getTime() - r.createdDate.getTime()) / (1000 * 60 * 60 * 24); // days
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
    } catch (error) {
      this.logger.error('SAE metrics calculation failed', error as Error);
      throw error;
    }
  }

  /**
   * Get open discrepancies
   */
  getOpenDiscrepancies(saeId?: string): SAEDiscrepancy[] {
    try {
      let discrepancies = Array.from(this.discrepancies.values()).filter((d) => d.status === 'open');

      if (saeId) {
        discrepancies = discrepancies.filter((d) => d.saeId === saeId);
      }

      return discrepancies;
    } catch (error) {
      this.logger.error('Open discrepancies retrieval failed', error as Error);
      throw error;
    }
  }

  /**
   * Get critical discrepancies
   */
  getCriticalDiscrepancies(): SAEDiscrepancy[] {
    try {
      return Array.from(this.discrepancies.values()).filter((d) => d.severity === 'critical' && d.status === 'open');
    } catch (error) {
      this.logger.error('Critical discrepancies retrieval failed', error as Error);
      throw error;
    }
  }

  /**
   * Get SAE by patient
   */
  getSAEByPatient(patientId: string): SAERecord[] {
    try {
      return Array.from(this.saeRecords.values()).filter((r) => r.patientId === patientId);
    } catch (error) {
      this.logger.error('SAE retrieval by patient failed', error as Error);
      throw error;
    }
  }
}

/**
 * Lab Metrics Component
 * Tracks lab-specific data quality metrics
 */

import { ILogger } from '../interfaces/components';
import { createLogger } from '../utils/logger';
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

export class LabMetricsComponent {
  private logger: ILogger;

  constructor() {
    this.logger = createLogger('LabMetricsComponent');
  }

  /**
   * Evaluate lab result quality
   */
  evaluateLabResult(labResult: LabResult): LabMetrics {
    try {
      const hasMissingLabName = !labResult.labName || labResult.labName.trim() === '';
      const hasMissingReferenceRange =
        !labResult.referenceRange || labResult.referenceRange.min === undefined || labResult.referenceRange.max === undefined;
      const hasMissingUnit = !labResult.unit || labResult.unit.trim() === '';

      // Determine if reconciled (has all required fields)
      const isReconciled = !hasMissingLabName && !hasMissingReferenceRange && !hasMissingUnit;

      // Calculate quality score
      let qualityScore = 100;
      if (hasMissingLabName) qualityScore -= 25;
      if (hasMissingReferenceRange) qualityScore -= 25;
      if (hasMissingUnit) qualityScore -= 25;
      if (labResult.dataQualityIssues && labResult.dataQualityIssues.length > 0) {
        qualityScore -= Math.min(25, labResult.dataQualityIssues.length * 5);
      }

      return {
        labResultId: labResult.labResultId,
        testName: labResult.testName,
        labName: labResult.labName,
        hasMissingLabName,
        hasMissingReferenceRange,
        hasMissingUnit,
        isReconciled,
        qualityScore: Math.max(0, qualityScore),
      };
    } catch (error) {
      this.logger.error('Lab result evaluation failed', error as Error);
      throw error;
    }
  }

  /**
   * Generate lab reconciliation report
   */
  generateLabReconciliationReport(labResults: LabResult[]): LabReconciliationReport {
    try {
      if (labResults.length === 0) {
        return {
          totalLabResults: 0,
          resultsWithMissingLabName: 0,
          resultsWithMissingRanges: 0,
          resultsWithMissingUnits: 0,
          reconciliationPercentage: 0,
          criticalIssues: [],
        };
      }

      const metrics = labResults.map((lr) => this.evaluateLabResult(lr));

      const resultsWithMissingLabName = metrics.filter((m) => m.hasMissingLabName).length;
      const resultsWithMissingRanges = metrics.filter((m) => m.hasMissingReferenceRange).length;
      const resultsWithMissingUnits = metrics.filter((m) => m.hasMissingUnit).length;

      const reconciledResults = metrics.filter((m) => m.isReconciled).length;
      const reconciliationPercentage = (reconciledResults / labResults.length) * 100;

      const criticalIssues = metrics.filter((m) => m.qualityScore < 50);

      return {
        totalLabResults: labResults.length,
        resultsWithMissingLabName,
        resultsWithMissingRanges,
        resultsWithMissingUnits,
        reconciliationPercentage: Math.round(reconciliationPercentage * 100) / 100,
        criticalIssues,
      };
    } catch (error) {
      this.logger.error('Lab reconciliation report generation failed', error as Error);
      throw error;
    }
  }

  /**
   * Track missing lab names
   */
  trackMissingLabNames(labResults: LabResult[]): LabResult[] {
    return labResults.filter((lr) => !lr.labName || lr.labName.trim() === '');
  }

  /**
   * Track missing reference ranges
   */
  trackMissingRanges(labResults: LabResult[]): LabResult[] {
    return labResults.filter(
      (lr) => !lr.referenceRange || lr.referenceRange.min === undefined || lr.referenceRange.max === undefined
    );
  }

  /**
   * Track missing units
   */
  trackMissingUnits(labResults: LabResult[]): LabResult[] {
    return labResults.filter((lr) => !lr.unit || lr.unit.trim() === '');
  }

  /**
   * Get lab quality summary by test name
   */
  getLabQualitySummaryByTest(labResults: LabResult[]): Record<string, { total: number; quality: number }> {
    try {
      const summary: Record<string, { total: number; quality: number }> = {};

      labResults.forEach((lr) => {
        if (!summary[lr.testName]) {
          summary[lr.testName] = { total: 0, quality: 0 };
        }
        summary[lr.testName].total += 1;

        const metrics = this.evaluateLabResult(lr);
        summary[lr.testName].quality += metrics.qualityScore;
      });

      // Calculate average quality per test
      Object.keys(summary).forEach((testName) => {
        summary[testName].quality = Math.round((summary[testName].quality / summary[testName].total) * 100) / 100;
      });

      return summary;
    } catch (error) {
      this.logger.error('Lab quality summary generation failed', error as Error);
      throw error;
    }
  }
}

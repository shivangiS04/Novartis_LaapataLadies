/**
 * Lab Metrics Component Tests
 */

import { LabMetricsComponent } from '../../components/LabMetricsComponent';
import { LabResult } from '../../types/index';

describe('LabMetricsComponent', () => {
  let component: LabMetricsComponent;

  beforeEach(() => {
    component = new LabMetricsComponent();
  });

  describe('evaluateLabResult', () => {
    it('should evaluate a complete lab result', () => {
      const labResult: LabResult = {
        labResultId: 'LR001',
        patientId: 'P001',
        testName: 'Hemoglobin',
        value: 13.5,
        unit: 'g/dL',
        referenceRange: { min: 12, max: 17 },
        abnormalFlag: false,
        labName: 'Central Lab',
        resultDate: new Date(),
        reportedDate: new Date(),
        dataQualityIssues: [],
      };

      const metrics = component.evaluateLabResult(labResult);

      expect(metrics.labResultId).toBe('LR001');
      expect(metrics.hasMissingLabName).toBe(false);
      expect(metrics.hasMissingReferenceRange).toBe(false);
      expect(metrics.hasMissingUnit).toBe(false);
      expect(metrics.isReconciled).toBe(true);
      expect(metrics.qualityScore).toBe(100);
    });

    it('should identify missing lab name', () => {
      const labResult: LabResult = {
        labResultId: 'LR002',
        patientId: 'P001',
        testName: 'Glucose',
        value: 95,
        unit: 'mg/dL',
        referenceRange: { min: 70, max: 100 },
        abnormalFlag: false,
        labName: '',
        resultDate: new Date(),
        reportedDate: new Date(),
        dataQualityIssues: [],
      };

      const metrics = component.evaluateLabResult(labResult);

      expect(metrics.hasMissingLabName).toBe(true);
      expect(metrics.isReconciled).toBe(false);
      expect(metrics.qualityScore).toBeLessThan(100);
    });

    it('should identify missing reference range', () => {
      const labResult: LabResult = {
        labResultId: 'LR003',
        patientId: 'P001',
        testName: 'Potassium',
        value: 4.2,
        unit: 'mEq/L',
        referenceRange: { min: undefined as unknown as number, max: undefined as unknown as number },
        abnormalFlag: false,
        labName: 'Central Lab',
        resultDate: new Date(),
        reportedDate: new Date(),
        dataQualityIssues: [],
      };

      const metrics = component.evaluateLabResult(labResult);

      expect(metrics.hasMissingReferenceRange).toBe(true);
      expect(metrics.qualityScore).toBeLessThan(100);
    });
  });

  describe('generateLabReconciliationReport', () => {
    it('should generate reconciliation report', () => {
      const labResults: LabResult[] = [
        {
          labResultId: 'LR001',
          patientId: 'P001',
          testName: 'Hemoglobin',
          value: 13.5,
          unit: 'g/dL',
          referenceRange: { min: 12, max: 17 },
          abnormalFlag: false,
          labName: 'Central Lab',
          resultDate: new Date(),
          reportedDate: new Date(),
          dataQualityIssues: [],
        },
        {
          labResultId: 'LR002',
          patientId: 'P001',
          testName: 'Glucose',
          value: 95,
          unit: 'mg/dL',
          referenceRange: { min: 70, max: 100 },
          abnormalFlag: false,
          labName: '',
          resultDate: new Date(),
          reportedDate: new Date(),
          dataQualityIssues: [],
        },
      ];

      const report = component.generateLabReconciliationReport(labResults);

      expect(report.totalLabResults).toBe(2);
      expect(report.resultsWithMissingLabName).toBe(1);
      expect(report.reconciliationPercentage).toBe(50);
    });

    it('should return empty report for no results', () => {
      const report = component.generateLabReconciliationReport([]);

      expect(report.totalLabResults).toBe(0);
      expect(report.reconciliationPercentage).toBe(0);
      expect(report.criticalIssues).toHaveLength(0);
    });
  });

  describe('trackMissingLabNames', () => {
    it('should identify results with missing lab names', () => {
      const labResults: LabResult[] = [
        {
          labResultId: 'LR001',
          patientId: 'P001',
          testName: 'Hemoglobin',
          value: 13.5,
          unit: 'g/dL',
          referenceRange: { min: 12, max: 17 },
          abnormalFlag: false,
          labName: 'Central Lab',
          resultDate: new Date(),
          reportedDate: new Date(),
          dataQualityIssues: [],
        },
        {
          labResultId: 'LR002',
          patientId: 'P001',
          testName: 'Glucose',
          value: 95,
          unit: 'mg/dL',
          referenceRange: { min: 70, max: 100 },
          abnormalFlag: false,
          labName: '',
          resultDate: new Date(),
          reportedDate: new Date(),
          dataQualityIssues: [],
        },
      ];

      const missing = component.trackMissingLabNames(labResults);

      expect(missing).toHaveLength(1);
      expect(missing[0].labResultId).toBe('LR002');
    });
  });

  describe('getLabQualitySummaryByTest', () => {
    it('should generate quality summary by test name', () => {
      const labResults: LabResult[] = [
        {
          labResultId: 'LR001',
          patientId: 'P001',
          testName: 'Hemoglobin',
          value: 13.5,
          unit: 'g/dL',
          referenceRange: { min: 12, max: 17 },
          abnormalFlag: false,
          labName: 'Central Lab',
          resultDate: new Date(),
          reportedDate: new Date(),
          dataQualityIssues: [],
        },
        {
          labResultId: 'LR002',
          patientId: 'P001',
          testName: 'Hemoglobin',
          value: 14.2,
          unit: 'g/dL',
          referenceRange: { min: 12, max: 17 },
          abnormalFlag: false,
          labName: 'Central Lab',
          resultDate: new Date(),
          reportedDate: new Date(),
          dataQualityIssues: [],
        },
      ];

      const summary = component.getLabQualitySummaryByTest(labResults);

      expect(summary.Hemoglobin).toBeDefined();
      expect(summary.Hemoglobin.total).toBe(2);
      expect(summary.Hemoglobin.quality).toBe(100);
    });
  });
});

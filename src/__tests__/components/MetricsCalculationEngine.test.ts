/**
 * Metrics Calculation Engine Tests
 */

import { MetricsCalculationEngine } from '../../components/MetricsCalculationEngine';
import { PatientModel } from '../../models/Patient';
import { Patient, Visit, FormStatus } from '../../types/index';

describe('MetricsCalculationEngine', () => {
  let engine: MetricsCalculationEngine;

  beforeEach(() => {
    engine = new MetricsCalculationEngine();
  });

  describe('calculatePatientMetrics', () => {
    it('should calculate metrics for a patient with complete data', () => {
      const patient = new PatientModel({
        patientId: 'P001',
        studyId: 'STUDY001',
        demographics: {
          age: 45,
          gender: 'M',
          enrollmentDate: new Date('2024-01-01'),
        },
        clinicalData: {
          visits: [
            {
              visitId: 'V001',
              patientId: 'P001',
              visitType: 'Baseline',
              scheduledDate: new Date('2024-01-15'),
              actualDate: new Date('2024-01-15'),
              formStatus: 'completed' as FormStatus,
              forms: [
                {
                  formId: 'F001',
                  formName: 'Demographics',
                  status: 'completed' as FormStatus,
                  completionPercentage: 100,
                  lastUpdated: new Date(),
                },
              ],
              completionPercentage: 100,
              delayDays: 0,
              lastUpdated: new Date(),
            },
          ],
          labResults: [],
          adverseEvents: [],
          medications: [],
        },
        dataQualityFlags: [],
        lastUpdated: new Date(),
        dataSource: 'EDC',
      });

      const metrics = engine.calculatePatientMetrics(patient, 1);

      expect(metrics.missingVisitPercentage).toBe(0);
      expect(metrics.cleanCRFPercentage).toBe(100);
      expect(metrics.cleanPatientStatus).toBe(true);
      expect(metrics.dataQualityIndex).toBeGreaterThan(90);
    });

    it('should calculate metrics for a patient with missing visits', () => {
      const patient = new PatientModel({
        patientId: 'P002',
        studyId: 'STUDY001',
        demographics: {
          age: 50,
          gender: 'F',
          enrollmentDate: new Date('2024-01-01'),
        },
        clinicalData: {
          visits: [],
          labResults: [],
          adverseEvents: [],
          medications: [],
        },
        dataQualityFlags: [],
        lastUpdated: new Date(),
        dataSource: 'EDC',
      });

      const metrics = engine.calculatePatientMetrics(patient, 5);

      expect(metrics.missingVisitPercentage).toBe(100);
      expect(metrics.cleanPatientStatus).toBe(false);
      expect(metrics.dataQualityIndex).toBeLessThan(50);
    });

    it('should calculate metrics for a patient with quality issues', () => {
      const patient = new PatientModel({
        patientId: 'P003',
        studyId: 'STUDY001',
        demographics: {
          age: 55,
          gender: 'M',
          enrollmentDate: new Date('2024-01-01'),
        },
        clinicalData: {
          visits: [
            {
              visitId: 'V001',
              patientId: 'P003',
              visitType: 'Baseline',
              scheduledDate: new Date('2024-01-15'),
              actualDate: new Date('2024-01-15'),
              formStatus: 'completed' as FormStatus,
              forms: [],
              completionPercentage: 100,
              delayDays: 0,
              lastUpdated: new Date(),
            },
          ],
          labResults: [],
          adverseEvents: [],
          medications: [],
        },
        dataQualityFlags: [
          {
            issueId: 'I001',
            recordId: 'R001',
            issueType: 'missing_value',
            severity: 'high',
            description: 'Missing lab value',
            affectedField: 'labValue',
            detectedDate: new Date(),
          },
        ],
        lastUpdated: new Date(),
        dataSource: 'EDC',
      });

      const metrics = engine.calculatePatientMetrics(patient, 1);

      expect(metrics.nonConformantDataPercentage).toBeGreaterThan(0);
      expect(metrics.cleanPatientStatus).toBe(false);
    });
  });

  describe('calculateSiteMetrics', () => {
    it('should calculate site-level metrics', () => {
      const patients = [
        new PatientModel({
          patientId: 'P001',
          studyId: 'STUDY001',
          demographics: {
            age: 45,
            gender: 'M',
            enrollmentDate: new Date('2024-01-01'),
          },
          clinicalData: {
            visits: [
              {
                visitId: 'V001',
                patientId: 'P001',
                visitType: 'Baseline',
                scheduledDate: new Date('2024-01-15'),
                actualDate: new Date('2024-01-15'),
                formStatus: 'completed' as FormStatus,
                forms: [],
                completionPercentage: 100,
                delayDays: 0,
                lastUpdated: new Date(),
              },
            ],
            labResults: [],
            adverseEvents: [],
            medications: [],
          },
          dataQualityFlags: [],
          lastUpdated: new Date(),
          dataSource: 'EDC',
        }),
      ];

      const siteMetrics = engine.calculateSiteMetrics(patients, 'SITE001', 1);

      expect(siteMetrics.siteId).toBe('SITE001');
      expect(siteMetrics.totalPatients).toBe(1);
      expect(siteMetrics.averageDataQualityIndex).toBeGreaterThan(80);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(siteMetrics.performanceRating);
    });

    it('should return fair rating for empty site', () => {
      const siteMetrics = engine.calculateSiteMetrics([], 'SITE002', 1);

      expect(siteMetrics.totalPatients).toBe(0);
      expect(siteMetrics.performanceRating).toBe('fair');
    });
  });

  describe('calculateTrialMetrics', () => {
    it('should calculate trial-level metrics', () => {
      const patients = [
        new PatientModel({
          patientId: 'P001',
          studyId: 'STUDY001',
          demographics: {
            age: 45,
            gender: 'M',
            enrollmentDate: new Date('2024-01-01'),
          },
          clinicalData: {
            visits: [
              {
                visitId: 'V001',
                patientId: 'P001',
                visitType: 'Baseline',
                scheduledDate: new Date('2024-01-15'),
                actualDate: new Date('2024-01-15'),
                formStatus: 'completed' as FormStatus,
                forms: [],
                completionPercentage: 100,
                delayDays: 0,
                lastUpdated: new Date(),
              },
            ],
            labResults: [],
            adverseEvents: [],
            medications: [],
          },
          dataQualityFlags: [],
          lastUpdated: new Date(),
          dataSource: 'EDC',
        }),
      ];

      const trialMetrics = engine.calculateTrialMetrics(patients, 'STUDY001', 5, 1);

      expect(trialMetrics.studyId).toBe('STUDY001');
      expect(trialMetrics.totalPatients).toBe(1);
      expect(trialMetrics.totalSites).toBe(5);
      expect(trialMetrics.overallDataQualityIndex).toBeGreaterThan(0);
    });
  });

  describe('identifyUnderperformingSites', () => {
    it('should identify sites below threshold', () => {
      const siteMetrics = [
        {
          siteId: 'SITE001',
          totalPatients: 10,
          averageMissingVisitPercentage: 5,
          averageCleanCRFPercentage: 95,
          averageDataQualityIndex: 90,
          performanceRating: 'excellent' as const,
        },
        {
          siteId: 'SITE002',
          totalPatients: 10,
          averageMissingVisitPercentage: 30,
          averageCleanCRFPercentage: 60,
          averageDataQualityIndex: 65,
          performanceRating: 'fair' as const,
        },
      ];

      const underperforming = engine.identifyUnderperformingSites(siteMetrics, 75);

      expect(underperforming).toHaveLength(1);
      expect(underperforming[0].siteId).toBe('SITE002');
    });
  });

  describe('calculateDeviationMetrics', () => {
    it('should calculate deviation counts by type', () => {
      const patients = [
        new PatientModel({
          patientId: 'P001',
          studyId: 'STUDY001',
          demographics: {
            age: 45,
            gender: 'M',
            enrollmentDate: new Date('2024-01-01'),
          },
          clinicalData: {
            visits: [],
            labResults: [],
            adverseEvents: [],
            medications: [],
          },
          dataQualityFlags: [
            {
              issueId: 'I001',
              recordId: 'R001',
              issueType: 'missing_value',
              severity: 'high',
              description: 'Missing value',
              affectedField: 'field1',
              detectedDate: new Date(),
            },
            {
              issueId: 'I002',
              recordId: 'R002',
              issueType: 'anomaly',
              severity: 'medium',
              description: 'Anomaly detected',
              affectedField: 'field2',
              detectedDate: new Date(),
            },
          ],
          lastUpdated: new Date(),
          dataSource: 'EDC',
        }),
      ];

      const deviations = engine.calculateDeviationMetrics(patients);

      expect(deviations.missing_value).toBe(1);
      expect(deviations.anomaly).toBe(1);
    });
  });
});

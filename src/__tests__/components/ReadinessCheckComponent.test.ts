/**
 * Readiness Check Component Tests
 */

import { ReadinessCheckComponent } from '../../components/ReadinessCheckComponent';
import { PatientModel } from '../../models/Patient';
import { FormStatus } from '../../types/index';

describe('ReadinessCheckComponent', () => {
  let component: ReadinessCheckComponent;

  beforeEach(() => {
    component = new ReadinessCheckComponent();
  });

  describe('checkInterimAnalysisReadiness', () => {
    it('should indicate readiness when criteria are met', () => {
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

      const metrics = {
        dataQualityIndex: 90,
      };

      const result = component.checkInterimAnalysisReadiness(patients, metrics);

      expect(result.checkType).toBe('interim_analysis');
      expect(result.criteria).toBeDefined();
      expect(result.criteria.length).toBeGreaterThan(0);
    });

    it('should identify issues when criteria are not met', () => {
      const patients = [
        new PatientModel({
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
        }),
      ];

      const metrics = {
        dataQualityIndex: 50,
      };

      const result = component.checkInterimAnalysisReadiness(patients, metrics);

      expect(result.isReady).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('checkSubmissionReadiness', () => {
    it('should have stricter criteria than interim analysis', () => {
      const patients = [
        new PatientModel({
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
          dataQualityFlags: [],
          lastUpdated: new Date(),
          dataSource: 'EDC',
        }),
      ];

      const metrics = {
        dataQualityIndex: 90,
      };

      const result = component.checkSubmissionReadiness(patients, metrics);

      expect(result.checkType).toBe('submission');
      expect(result.isReady).toBe(false); // DQI 90 is below submission threshold of 95
    });
  });

  describe('setInterimAnalysisCriteria', () => {
    it('should allow custom criteria', () => {
      component.setInterimAnalysisCriteria({
        minDataQualityIndex: 80,
        minDataCompleteness: 0.85,
      });

      const patients = [
        new PatientModel({
          patientId: 'P004',
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
                patientId: 'P004',
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

      const metrics = {
        dataQualityIndex: 82,
      };

      const result = component.checkInterimAnalysisReadiness(patients, metrics);

      // Should pass with custom criteria
      expect(result.criteria.some((c) => c.criteriaName === 'Data Quality Index' && c.isMet)).toBe(true);
    });
  });

  describe('setSubmissionCriteria', () => {
    it('should allow custom submission criteria', () => {
      component.setSubmissionCriteria({
        minDataQualityIndex: 90,
        maxCriticalIssues: 2,
      });

      const patients = [
        new PatientModel({
          patientId: 'P005',
          studyId: 'STUDY001',
          demographics: {
            age: 50,
            gender: 'F',
            enrollmentDate: new Date('2024-01-01'),
          },
          clinicalData: {
            visits: [
              {
                visitId: 'V001',
                patientId: 'P005',
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

      const metrics = {
        dataQualityIndex: 92,
      };

      const result = component.checkSubmissionReadiness(patients, metrics);

      expect(result.criteria.some((c) => c.criteriaName === 'Data Quality Index' && c.isMet)).toBe(true);
    });
  });

  describe('readiness check result structure', () => {
    it('should include all required fields in result', () => {
      const patients = [
        new PatientModel({
          patientId: 'P006',
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
          dataQualityFlags: [],
          lastUpdated: new Date(),
          dataSource: 'EDC',
        }),
      ];

      const metrics = {
        dataQualityIndex: 50,
      };

      const result = component.checkInterimAnalysisReadiness(patients, metrics);

      expect(result.checkType).toBeDefined();
      expect(result.isReady).toBeDefined();
      expect(result.overallScore).toBeDefined();
      expect(result.criteria).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.checkedDate).toBeDefined();
    });
  });
});

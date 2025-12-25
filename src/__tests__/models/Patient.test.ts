/**
 * Property-Based Tests for Patient Model
 * **Feature: clinical-trial-data-integration, Property 1: Data Ingestion Completeness**
 * **Validates: Requirements 1.1, 1.3**
 */

import { PatientModel } from '../../models/Patient';
import { Patient, Visit, LabResult } from '../../types/index';

describe('PatientModel - Property 1: Data Ingestion Completeness', () => {
  test('should preserve all non-null fields from original data after creation', () => {
    // Arrange
    const originalData: Partial<Patient> = {
      patientId: 'P001',
      studyId: 'S001',
      demographics: {
        age: 45,
        gender: 'M',
        enrollmentDate: new Date('2023-01-01'),
      },
      dataSource: 'EDC_SYSTEM',
    };

    // Act
    const patient = new PatientModel(originalData);

    // Assert
    expect(patient.patientId).toBe(originalData.patientId);
    expect(patient.studyId).toBe(originalData.studyId);
    expect(patient.demographics.age).toBe(originalData.demographics?.age);
    expect(patient.demographics.gender).toBe(originalData.demographics?.gender);
    expect(patient.demographics.enrollmentDate).toEqual(originalData.demographics?.enrollmentDate);
    expect(patient.dataSource).toBe(originalData.dataSource);
  });

  test('should preserve all visits added to patient', () => {
    // Arrange
    const patient = new PatientModel({ patientId: 'P001', studyId: 'S001' });
    const visit: Visit = {
      visitId: 'V001',
      patientId: 'P001',
      visitType: 'Baseline',
      scheduledDate: new Date('2023-01-15'),
      formStatus: 'completed',
      forms: [],
      completionPercentage: 100,
      delayDays: 0,
      lastUpdated: new Date(),
    };

    // Act
    patient.addVisit(visit);

    // Assert
    expect(patient.clinicalData.visits).toHaveLength(1);
    expect(patient.clinicalData.visits[0]).toEqual(visit);
  });

  test('should preserve all lab results added to patient', () => {
    // Arrange
    const patient = new PatientModel({ patientId: 'P001', studyId: 'S001' });
    const labResult: LabResult = {
      labResultId: 'L001',
      patientId: 'P001',
      testName: 'Hemoglobin',
      value: 14.5,
      unit: 'g/dL',
      referenceRange: { min: 12, max: 17 },
      abnormalFlag: false,
      labName: 'Central Lab',
      resultDate: new Date('2023-01-20'),
      reportedDate: new Date('2023-01-21'),
      dataQualityIssues: [],
    };

    // Act
    patient.addLabResult(labResult);

    // Assert
    expect(patient.clinicalData.labResults).toHaveLength(1);
    expect(patient.clinicalData.labResults[0]).toEqual(labResult);
  });

  test('should preserve multiple data items without loss', () => {
    // Arrange
    const patient = new PatientModel({ patientId: 'P001', studyId: 'S001' });
    const visits: Visit[] = [
      {
        visitId: 'V001',
        patientId: 'P001',
        visitType: 'Baseline',
        scheduledDate: new Date('2023-01-15'),
        formStatus: 'completed',
        forms: [],
        completionPercentage: 100,
        delayDays: 0,
        lastUpdated: new Date(),
      },
      {
        visitId: 'V002',
        patientId: 'P001',
        visitType: 'Week 4',
        scheduledDate: new Date('2023-02-15'),
        formStatus: 'completed',
        forms: [],
        completionPercentage: 100,
        delayDays: 0,
        lastUpdated: new Date(),
      },
    ];

    // Act
    visits.forEach((v) => patient.addVisit(v));

    // Assert
    expect(patient.clinicalData.visits).toHaveLength(2);
    expect(patient.clinicalData.visits).toEqual(visits);
  });

  test('should maintain data integrity through JSON serialization', () => {
    // Arrange
    const originalData: Partial<Patient> = {
      patientId: 'P001',
      studyId: 'S001',
      demographics: {
        age: 45,
        gender: 'M',
        enrollmentDate: new Date('2023-01-01'),
      },
      dataSource: 'EDC_SYSTEM',
    };

    // Act
    const patient = new PatientModel(originalData);
    const json = patient.toJSON();

    // Assert
    expect(json.patientId).toBe(originalData.patientId);
    expect(json.studyId).toBe(originalData.studyId);
    expect(json.dataSource).toBe(originalData.dataSource);
  });
});

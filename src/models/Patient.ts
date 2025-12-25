/**
 * Patient Model
 */

import { Patient, Visit, LabResult, AdverseEvent, Medication, DataQualityIssue } from '../types/index';
import { ValidationResult, ValidationError, ValidationWarning } from '../types/index';

export class PatientModel implements Patient {
  patientId: string;
  studyId: string;
  demographics: {
    age: number;
    gender: string;
    enrollmentDate: Date;
  };
  clinicalData: {
    visits: Visit[];
    labResults: LabResult[];
    adverseEvents: AdverseEvent[];
    medications: Medication[];
  };
  dataQualityFlags: DataQualityIssue[];
  lastUpdated: Date;
  dataSource: string;

  constructor(data: Partial<Patient>) {
    this.patientId = data.patientId || '';
    this.studyId = data.studyId || '';
    this.demographics = data.demographics || { age: 0, gender: '', enrollmentDate: new Date() };
    this.clinicalData = data.clinicalData || {
      visits: [],
      labResults: [],
      adverseEvents: [],
      medications: [],
    };
    this.dataQualityFlags = data.dataQualityFlags || [];
    this.lastUpdated = data.lastUpdated || new Date();
    this.dataSource = data.dataSource || '';
  }

  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate required fields
    if (!this.patientId || this.patientId.trim() === '') {
      errors.push({
        field: 'patientId',
        message: 'Patient ID is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!this.studyId || this.studyId.trim() === '') {
      errors.push({
        field: 'studyId',
        message: 'Study ID is required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Validate demographics
    if (this.demographics.age < 0 || this.demographics.age > 150) {
      errors.push({
        field: 'demographics.age',
        message: 'Age must be between 0 and 150',
        code: 'INVALID_VALUE',
      });
    }

    if (!this.demographics.gender || !['M', 'F', 'O', 'U'].includes(this.demographics.gender)) {
      warnings.push({
        field: 'demographics.gender',
        message: 'Gender should be M, F, O, or U',
        code: 'INVALID_VALUE',
      });
    }

    if (!this.demographics.enrollmentDate) {
      errors.push({
        field: 'demographics.enrollmentDate',
        message: 'Enrollment date is required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Validate data source
    if (!this.dataSource || this.dataSource.trim() === '') {
      warnings.push({
        field: 'dataSource',
        message: 'Data source should be specified',
        code: 'RECOMMENDED_FIELD',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  addVisit(visit: Visit): void {
    this.clinicalData.visits.push(visit);
    this.lastUpdated = new Date();
  }

  addLabResult(labResult: LabResult): void {
    this.clinicalData.labResults.push(labResult);
    this.lastUpdated = new Date();
  }

  addAdverseEvent(event: AdverseEvent): void {
    this.clinicalData.adverseEvents.push(event);
    this.lastUpdated = new Date();
  }

  addMedication(medication: Medication): void {
    this.clinicalData.medications.push(medication);
    this.lastUpdated = new Date();
  }

  addDataQualityFlag(flag: DataQualityIssue): void {
    this.dataQualityFlags.push(flag);
    this.lastUpdated = new Date();
  }

  getCompletionPercentage(): number {
    if (this.clinicalData.visits.length === 0) {
      return 0;
    }

    const totalCompletion = this.clinicalData.visits.reduce((sum, visit) => sum + visit.completionPercentage, 0);
    return totalCompletion / this.clinicalData.visits.length;
  }

  toJSON(): Record<string, unknown> {
    return {
      patientId: this.patientId,
      studyId: this.studyId,
      demographics: this.demographics,
      clinicalData: this.clinicalData,
      dataQualityFlags: this.dataQualityFlags,
      lastUpdated: this.lastUpdated,
      dataSource: this.dataSource,
    };
  }
}

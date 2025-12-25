/**
 * Data Quality Issue Model
 */

import { DataQualityIssue, DataQualityIssueType, SeverityLevel } from '../types/index';
import { ValidationResult, ValidationError, ValidationWarning } from '../types/index';

export class DataQualityIssueModel implements DataQualityIssue {
  issueId: string;
  recordId: string;
  issueType: DataQualityIssueType;
  severity: SeverityLevel;
  description: string;
  affectedField: string;
  detectedDate: Date;
  resolvedDate?: Date;
  resolution?: string;
  resolutionTime?: number;

  constructor(data: Partial<DataQualityIssue>) {
    this.issueId = data.issueId || '';
    this.recordId = data.recordId || '';
    this.issueType = data.issueType || 'missing_value';
    this.severity = data.severity || 'medium';
    this.description = data.description || '';
    this.affectedField = data.affectedField || '';
    this.detectedDate = data.detectedDate || new Date();
    this.resolvedDate = data.resolvedDate;
    this.resolution = data.resolution;
    this.resolutionTime = data.resolutionTime;
  }

  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!this.issueId || this.issueId.trim() === '') {
      errors.push({
        field: 'issueId',
        message: 'Issue ID is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!this.recordId || this.recordId.trim() === '') {
      errors.push({
        field: 'recordId',
        message: 'Record ID is required',
        code: 'REQUIRED_FIELD',
      });
    }

    const validIssueTypes: DataQualityIssueType[] = ['missing_value', 'invalid_format', 'inconsistency', 'anomaly'];
    if (!validIssueTypes.includes(this.issueType)) {
      errors.push({
        field: 'issueType',
        message: `Issue type must be one of: ${validIssueTypes.join(', ')}`,
        code: 'INVALID_VALUE',
      });
    }

    const validSeverities: SeverityLevel[] = ['critical', 'high', 'medium', 'low'];
    if (!validSeverities.includes(this.severity)) {
      errors.push({
        field: 'severity',
        message: `Severity must be one of: ${validSeverities.join(', ')}`,
        code: 'INVALID_VALUE',
      });
    }

    if (!this.description || this.description.trim() === '') {
      warnings.push({
        field: 'description',
        message: 'Description should be provided',
        code: 'RECOMMENDED_FIELD',
      });
    }

    if (!this.affectedField || this.affectedField.trim() === '') {
      warnings.push({
        field: 'affectedField',
        message: 'Affected field should be specified',
        code: 'RECOMMENDED_FIELD',
      });
    }

    if (this.resolvedDate && this.resolvedDate < this.detectedDate) {
      errors.push({
        field: 'resolvedDate',
        message: 'Resolution date cannot be before detection date',
        code: 'INVALID_VALUE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  resolve(resolution: string): void {
    this.resolvedDate = new Date();
    this.resolution = resolution;
    this.resolutionTime = Math.floor((this.resolvedDate.getTime() - this.detectedDate.getTime()) / (1000 * 60));
  }

  isResolved(): boolean {
    return this.resolvedDate !== undefined && this.resolution !== undefined;
  }

  toJSON(): Record<string, unknown> {
    return {
      issueId: this.issueId,
      recordId: this.recordId,
      issueType: this.issueType,
      severity: this.severity,
      description: this.description,
      affectedField: this.affectedField,
      detectedDate: this.detectedDate,
      resolvedDate: this.resolvedDate,
      resolution: this.resolution,
      resolutionTime: this.resolutionTime,
    };
  }
}

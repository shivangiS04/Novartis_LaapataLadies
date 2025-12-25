/**
 * Alert Model
 */

import { Alert, SeverityLevel, AlertStatus } from '../types/index';
import { ValidationResult, ValidationError, ValidationWarning } from '../types/index';

export class AlertModel implements Alert {
  alertId: string;
  type: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  affectedRecords: string[];
  relatedIssues: string[];
  assignedTo: string[];
  status: AlertStatus;
  createdDate: Date;
  resolvedDate?: Date;
  resolutionNotes?: string;

  constructor(data: Partial<Alert>) {
    this.alertId = data.alertId || '';
    this.type = data.type || '';
    this.severity = data.severity || 'medium';
    this.title = data.title || '';
    this.description = data.description || '';
    this.affectedRecords = data.affectedRecords || [];
    this.relatedIssues = data.relatedIssues || [];
    this.assignedTo = data.assignedTo || [];
    this.status = data.status || 'open';
    this.createdDate = data.createdDate || new Date();
    this.resolvedDate = data.resolvedDate;
    this.resolutionNotes = data.resolutionNotes;
  }

  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!this.alertId || this.alertId.trim() === '') {
      errors.push({
        field: 'alertId',
        message: 'Alert ID is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!this.type || this.type.trim() === '') {
      errors.push({
        field: 'type',
        message: 'Alert type is required',
        code: 'REQUIRED_FIELD',
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

    if (!this.title || this.title.trim() === '') {
      errors.push({
        field: 'title',
        message: 'Alert title is required',
        code: 'REQUIRED_FIELD',
      });
    }

    const validStatuses: AlertStatus[] = ['open', 'acknowledged', 'resolved', 'closed'];
    if (!validStatuses.includes(this.status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_VALUE',
      });
    }

    if (this.resolvedDate && this.resolvedDate < this.createdDate) {
      errors.push({
        field: 'resolvedDate',
        message: 'Resolution date cannot be before creation date',
        code: 'INVALID_VALUE',
      });
    }

    if (this.affectedRecords.length === 0) {
      warnings.push({
        field: 'affectedRecords',
        message: 'At least one affected record should be specified',
        code: 'RECOMMENDED_FIELD',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  acknowledge(): void {
    this.status = 'acknowledged';
  }

  resolve(notes: string): void {
    this.status = 'resolved';
    this.resolvedDate = new Date();
    this.resolutionNotes = notes;
  }

  close(): void {
    this.status = 'closed';
  }

  isOpen(): boolean {
    return this.status === 'open';
  }

  isResolved(): boolean {
    return this.status === 'resolved' || this.status === 'closed';
  }

  addAffectedRecord(recordId: string): void {
    if (!this.affectedRecords.includes(recordId)) {
      this.affectedRecords.push(recordId);
    }
  }

  addRelatedIssue(issueId: string): void {
    if (!this.relatedIssues.includes(issueId)) {
      this.relatedIssues.push(issueId);
    }
  }

  assignTo(userId: string): void {
    if (!this.assignedTo.includes(userId)) {
      this.assignedTo.push(userId);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      alertId: this.alertId,
      type: this.type,
      severity: this.severity,
      title: this.title,
      description: this.description,
      affectedRecords: this.affectedRecords,
      relatedIssues: this.relatedIssues,
      assignedTo: this.assignedTo,
      status: this.status,
      createdDate: this.createdDate,
      resolvedDate: this.resolvedDate,
      resolutionNotes: this.resolutionNotes,
    };
  }
}

/**
 * Data Quality Monitoring Component
 */

import { IDataQualityComponent, IEventBus, ILogger } from '../interfaces/components';
import { DataQualityIssue, Alert, SeverityLevel, PaginationParams, PaginatedResponse } from '../types/index';
import { DataQualityIssueModel } from '../models/DataQualityIssue';
import { AlertModel } from '../models/Alert';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class DataQualityComponent implements IDataQualityComponent {
  private eventBus: IEventBus;
  private qualityIssues: Map<string, DataQualityIssue> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private qualityRules: Map<string, (data: unknown) => DataQualityIssue[]> = new Map();

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultRules();
  }

  async validateDataQuality(data: unknown, rules: Record<string, unknown>): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];

    if (typeof data !== 'object' || data === null) {
      return issues;
    }

    const obj = data as Record<string, unknown>;

    // Check completeness
    for (const [field, rule] of Object.entries(rules)) {
      if (typeof rule === 'object' && rule !== null) {
        const ruleObj = rule as Record<string, unknown>;
        if (ruleObj.required && !(field in obj)) {
          issues.push(
            new DataQualityIssueModel({
              issueId: uuidv4(),
              recordId: obj.id as string || 'unknown',
              issueType: 'missing_value',
              severity: 'high',
              description: `Required field ${field} is missing`,
              affectedField: field,
              detectedDate: new Date(),
            })
          );
        }
      }
    }

    return issues;
  }

  async detectAnomalies(data: unknown, historicalPatterns: unknown[]): Promise<DataQualityIssue[]> {
    const issues: DataQualityIssue[] = [];

    if (!Array.isArray(historicalPatterns) || historicalPatterns.length === 0) {
      return issues;
    }

    if (typeof data !== 'object' || data === null) {
      return issues;
    }

    const obj = data as Record<string, unknown>;

    // Simple statistical anomaly detection
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number') {
        const historicalValues = historicalPatterns
          .filter((p) => typeof p === 'object' && p !== null && key in (p as Record<string, unknown>))
          .map((p) => (p as Record<string, unknown>)[key])
          .filter((v) => typeof v === 'number') as number[];

        if (historicalValues.length > 0) {
          const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
          const stdDev = Math.sqrt(
            historicalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalValues.length
          );

          // Flag if value is more than 3 standard deviations from mean
          if (Math.abs(value - mean) > 3 * stdDev) {
            issues.push(
              new DataQualityIssueModel({
                issueId: uuidv4(),
                recordId: obj.id as string || 'unknown',
                issueType: 'anomaly',
                severity: 'medium',
                description: `Anomalous value detected for field ${key}: ${value}`,
                affectedField: key,
                detectedDate: new Date(),
              })
            );
          }
        }
      }
    }

    return issues;
  }

  async generateAlert(issue: DataQualityIssue, severity: string, stakeholders: string[]): Promise<Alert> {
    const alert = new AlertModel({
      alertId: uuidv4(),
      type: 'data_quality',
      severity: severity as SeverityLevel,
      title: `Data Quality Issue: ${issue.issueType}`,
      description: issue.description,
      affectedRecords: [issue.recordId],
      relatedIssues: [issue.issueId],
      assignedTo: stakeholders,
      status: 'open',
      createdDate: new Date(),
    });

    this.alerts.set(alert.alertId, alert);

    await this.eventBus.publish('alert.created', {
      alertId: alert.alertId,
      type: alert.type,
      severity: alert.severity,
      stakeholders,
    });

    return alert;
  }

  async trackResolution(alertId: string, resolution: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      (alert as any).resolve?.(resolution);
      await this.eventBus.publish('alert.resolved', {
        alertId,
        resolution,
        timestamp: new Date(),
      });
    }
  }

  async getQualityMetrics(params: PaginationParams): Promise<PaginatedResponse<DataQualityIssue>> {
    const issues = Array.from(this.qualityIssues.values());
    const total = issues.length;
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const data = issues.slice(start, end);

    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  private initializeDefaultRules(): void {
    this.qualityRules.set('completeness', (data: unknown) => {
      const issues: DataQualityIssue[] = [];
      if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        for (const [key, value] of Object.entries(obj)) {
          if (value === null || value === undefined || value === '') {
            issues.push(
              new DataQualityIssueModel({
                issueId: uuidv4(),
                recordId: obj.id as string || 'unknown',
                issueType: 'missing_value',
                severity: 'high',
                description: `Field ${key} is empty`,
                affectedField: key,
                detectedDate: new Date(),
              })
            );
          }
        }
      }
      return issues;
    });
  }
}

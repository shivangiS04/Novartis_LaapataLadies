"use strict";
/**
 * Data Quality Monitoring Component
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQualityComponent = void 0;
const DataQualityIssue_1 = require("../models/DataQualityIssue");
const Alert_1 = require("../models/Alert");
const uuid_1 = require("uuid");
class DataQualityComponent {
    constructor(eventBus) {
        this.qualityIssues = new Map();
        this.alerts = new Map();
        this.qualityRules = new Map();
        this.eventBus = eventBus;
        this.initializeDefaultRules();
    }
    async validateDataQuality(data, rules) {
        const issues = [];
        if (typeof data !== 'object' || data === null) {
            return issues;
        }
        const obj = data;
        // Check completeness
        for (const [field, rule] of Object.entries(rules)) {
            if (typeof rule === 'object' && rule !== null) {
                const ruleObj = rule;
                if (ruleObj.required && !(field in obj)) {
                    issues.push(new DataQualityIssue_1.DataQualityIssueModel({
                        issueId: (0, uuid_1.v4)(),
                        recordId: obj.id || 'unknown',
                        issueType: 'missing_value',
                        severity: 'high',
                        description: `Required field ${field} is missing`,
                        affectedField: field,
                        detectedDate: new Date(),
                    }));
                }
            }
        }
        return issues;
    }
    async detectAnomalies(data, historicalPatterns) {
        const issues = [];
        if (!Array.isArray(historicalPatterns) || historicalPatterns.length === 0) {
            return issues;
        }
        if (typeof data !== 'object' || data === null) {
            return issues;
        }
        const obj = data;
        // Simple statistical anomaly detection
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'number') {
                const historicalValues = historicalPatterns
                    .filter((p) => typeof p === 'object' && p !== null && key in p)
                    .map((p) => p[key])
                    .filter((v) => typeof v === 'number');
                if (historicalValues.length > 0) {
                    const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
                    const stdDev = Math.sqrt(historicalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalValues.length);
                    // Flag if value is more than 3 standard deviations from mean
                    if (Math.abs(value - mean) > 3 * stdDev) {
                        issues.push(new DataQualityIssue_1.DataQualityIssueModel({
                            issueId: (0, uuid_1.v4)(),
                            recordId: obj.id || 'unknown',
                            issueType: 'anomaly',
                            severity: 'medium',
                            description: `Anomalous value detected for field ${key}: ${value}`,
                            affectedField: key,
                            detectedDate: new Date(),
                        }));
                    }
                }
            }
        }
        return issues;
    }
    async generateAlert(issue, severity, stakeholders) {
        const alert = new Alert_1.AlertModel({
            alertId: (0, uuid_1.v4)(),
            type: 'data_quality',
            severity: severity,
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
    async trackResolution(alertId, resolution) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.resolve?.(resolution);
            await this.eventBus.publish('alert.resolved', {
                alertId,
                resolution,
                timestamp: new Date(),
            });
        }
    }
    async getQualityMetrics(params) {
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
    initializeDefaultRules() {
        this.qualityRules.set('completeness', (data) => {
            const issues = [];
            if (typeof data === 'object' && data !== null) {
                const obj = data;
                for (const [key, value] of Object.entries(obj)) {
                    if (value === null || value === undefined || value === '') {
                        issues.push(new DataQualityIssue_1.DataQualityIssueModel({
                            issueId: (0, uuid_1.v4)(),
                            recordId: obj.id || 'unknown',
                            issueType: 'missing_value',
                            severity: 'high',
                            description: `Field ${key} is empty`,
                            affectedField: key,
                            detectedDate: new Date(),
                        }));
                    }
                }
            }
            return issues;
        });
    }
}
exports.DataQualityComponent = DataQualityComponent;
//# sourceMappingURL=DataQualityComponent.js.map
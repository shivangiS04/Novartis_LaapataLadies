"use strict";
/**
 * Alert Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertModel = void 0;
class AlertModel {
    constructor(data) {
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
    validate() {
        const errors = [];
        const warnings = [];
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
        const validSeverities = ['critical', 'high', 'medium', 'low'];
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
        const validStatuses = ['open', 'acknowledged', 'resolved', 'closed'];
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
    acknowledge() {
        this.status = 'acknowledged';
    }
    resolve(notes) {
        this.status = 'resolved';
        this.resolvedDate = new Date();
        this.resolutionNotes = notes;
    }
    close() {
        this.status = 'closed';
    }
    isOpen() {
        return this.status === 'open';
    }
    isResolved() {
        return this.status === 'resolved' || this.status === 'closed';
    }
    addAffectedRecord(recordId) {
        if (!this.affectedRecords.includes(recordId)) {
            this.affectedRecords.push(recordId);
        }
    }
    addRelatedIssue(issueId) {
        if (!this.relatedIssues.includes(issueId)) {
            this.relatedIssues.push(issueId);
        }
    }
    assignTo(userId) {
        if (!this.assignedTo.includes(userId)) {
            this.assignedTo.push(userId);
        }
    }
    toJSON() {
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
exports.AlertModel = AlertModel;
//# sourceMappingURL=Alert.js.map
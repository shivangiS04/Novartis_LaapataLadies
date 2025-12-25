"use strict";
/**
 * Data Harmonization Component
 * Handles deduplication and merging of data from multiple sources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataHarmonizationComponent = void 0;
const logger_1 = require("../utils/logger");
class DataHarmonizationComponent {
    constructor() {
        this.deduplicationRules = new Map();
        this.transformationAuditLog = [];
        this.logger = (0, logger_1.createLogger)('DataHarmonizationComponent');
    }
    async harmonizeData(rawData, harmonizationRules) {
        try {
            this.logger.info('Harmonizing data', { rules: harmonizationRules });
            if (typeof rawData !== 'object' || rawData === null) {
                return rawData;
            }
            const data = rawData;
            const harmonized = {};
            // Apply harmonization rules
            for (const [key, rule] of Object.entries(harmonizationRules)) {
                if (key in data) {
                    harmonized[key] = this.applyRule(data[key], rule);
                }
            }
            // Log transformation
            this.transformationAuditLog.push({
                timestamp: new Date(),
                operation: 'harmonize',
                details: { input: data, output: harmonized },
            });
            return harmonized;
        }
        catch (error) {
            this.logger.error('Data harmonization failed', error);
            throw error;
        }
    }
    async deduplicateRecords(records, matchingRules) {
        try {
            this.logger.info('Deduplicating records', { recordCount: records.length });
            if (!Array.isArray(records) || records.length === 0) {
                return records;
            }
            const deduplicated = [];
            const seen = new Set();
            for (const record of records) {
                if (typeof record !== 'object' || record === null) {
                    deduplicated.push(record);
                    continue;
                }
                const recordObj = record;
                const fingerprint = this.generateFingerprint(recordObj, matchingRules);
                if (!seen.has(fingerprint)) {
                    seen.add(fingerprint);
                    deduplicated.push(record);
                }
            }
            this.transformationAuditLog.push({
                timestamp: new Date(),
                operation: 'deduplicate',
                details: { inputCount: records.length, outputCount: deduplicated.length },
            });
            return deduplicated;
        }
        catch (error) {
            this.logger.error('Deduplication failed', error);
            throw error;
        }
    }
    async mergeRecords(record1, record2, mergeStrategy) {
        try {
            this.logger.info('Merging records', { strategy: mergeStrategy });
            if (typeof record1 !== 'object' || record1 === null || typeof record2 !== 'object' || record2 === null) {
                return record1;
            }
            const obj1 = record1;
            const obj2 = record2;
            const merged = { ...obj1 };
            for (const [key, value] of Object.entries(obj2)) {
                if (key in merged) {
                    merged[key] = this.resolveConflict(merged[key], value, mergeStrategy);
                }
                else {
                    merged[key] = value;
                }
            }
            this.transformationAuditLog.push({
                timestamp: new Date(),
                operation: 'merge',
                details: { strategy: mergeStrategy, record1: obj1, record2: obj2, merged },
            });
            return merged;
        }
        catch (error) {
            this.logger.error('Record merge failed', error);
            throw error;
        }
    }
    async getHarmonizationRules() {
        return {
            rules: Array.from(this.deduplicationRules.entries()).map(([key, rule]) => ({
                key,
                ...rule,
            })),
        };
    }
    getTransformationAuditLog() {
        return [...this.transformationAuditLog];
    }
    applyRule(value, rule) {
        if (typeof rule === 'string') {
            // Simple transformation rule
            switch (rule) {
                case 'uppercase':
                    return typeof value === 'string' ? value.toUpperCase() : value;
                case 'lowercase':
                    return typeof value === 'string' ? value.toLowerCase() : value;
                case 'trim':
                    return typeof value === 'string' ? value.trim() : value;
                default:
                    return value;
            }
        }
        if (typeof rule === 'object' && rule !== null) {
            const ruleObj = rule;
            if (ruleObj.type === 'map' && typeof ruleObj.mapping === 'object') {
                const mapping = ruleObj.mapping;
                return mapping[String(value)] ?? value;
            }
        }
        return value;
    }
    generateFingerprint(record, matchingRules) {
        const parts = [];
        for (const [key, rule] of Object.entries(matchingRules)) {
            if (key in record) {
                const value = record[key];
                if (typeof rule === 'object' && rule !== null) {
                    const ruleObj = rule;
                    if (ruleObj.fields && Array.isArray(ruleObj.fields)) {
                        const fields = ruleObj.fields;
                        for (const field of fields) {
                            if (field in record) {
                                parts.push(String(record[field]));
                            }
                        }
                    }
                }
                else {
                    parts.push(String(value));
                }
            }
        }
        return parts.join('|');
    }
    resolveConflict(value1, value2, strategy) {
        switch (strategy) {
            case 'latest-wins':
                return value2;
            case 'most-complete':
                return this.getMostComplete(value1, value2);
            case 'manual-review':
                // In real implementation, this would flag for manual review
                return value1;
            default:
                return value1;
        }
    }
    getMostComplete(value1, value2) {
        if (value1 === null || value1 === undefined)
            return value2;
        if (value2 === null || value2 === undefined)
            return value1;
        const str1 = String(value1);
        const str2 = String(value2);
        return str2.length > str1.length ? value2 : value1;
    }
}
exports.DataHarmonizationComponent = DataHarmonizationComponent;
//# sourceMappingURL=DataHarmonizationComponent.js.map
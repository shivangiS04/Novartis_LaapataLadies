"use strict";
/**
 * Coding Status Component
 * Tracks MedDRA and WHO Drug coding status
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodingStatusComponent = void 0;
const logger_1 = require("../utils/logger");
class CodingStatusComponent {
    constructor() {
        this.codingRecords = new Map();
        this.codingQueries = new Map();
        this.logger = (0, logger_1.createLogger)('CodingStatusComponent');
    }
    /**
     * Create or update a coding record
     */
    createCodingRecord(term, codingType, status = 'uncoded', code, preferredTerm) {
        try {
            const codingId = `${codingType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const record = {
                codingId,
                term,
                codingType,
                status,
                code,
                preferredTerm,
                createdDate: new Date(),
                lastUpdated: new Date(),
            };
            this.codingRecords.set(codingId, record);
            this.logger.info(`Coding record created: ${codingId}`);
            return record;
        }
        catch (error) {
            this.logger.error('Coding record creation failed', error);
            throw error;
        }
    }
    /**
     * Update coding status
     */
    updateCodingStatus(codingId, status, code, preferredTerm) {
        try {
            const record = this.codingRecords.get(codingId);
            if (!record) {
                throw new Error(`Coding record not found: ${codingId}`);
            }
            record.status = status;
            if (code)
                record.code = code;
            if (preferredTerm)
                record.preferredTerm = preferredTerm;
            record.lastUpdated = new Date();
            this.codingRecords.set(codingId, record);
            this.logger.info(`Coding status updated: ${codingId} -> ${status}`);
            return record;
        }
        catch (error) {
            this.logger.error('Coding status update failed', error);
            throw error;
        }
    }
    /**
     * Verify a coding record
     */
    verifyCodingRecord(codingId, verifiedBy) {
        try {
            const record = this.codingRecords.get(codingId);
            if (!record) {
                throw new Error(`Coding record not found: ${codingId}`);
            }
            record.status = 'verified';
            record.verifiedBy = verifiedBy;
            record.verifiedDate = new Date();
            record.lastUpdated = new Date();
            this.codingRecords.set(codingId, record);
            this.logger.info(`Coding record verified: ${codingId}`);
            return record;
        }
        catch (error) {
            this.logger.error('Coding verification failed', error);
            throw error;
        }
    }
    /**
     * Get coding status metrics
     */
    getCodingStatusMetrics(codingType) {
        try {
            let records = Array.from(this.codingRecords.values());
            if (codingType) {
                records = records.filter((r) => r.codingType === codingType);
            }
            if (records.length === 0) {
                return {
                    totalTerms: 0,
                    uncodedTerms: 0,
                    pendingTerms: 0,
                    codedTerms: 0,
                    verifiedTerms: 0,
                    codingCompletionPercentage: 0,
                    verificationPercentage: 0,
                };
            }
            const uncodedTerms = records.filter((r) => r.status === 'uncoded').length;
            const pendingTerms = records.filter((r) => r.status === 'pending').length;
            const codedTerms = records.filter((r) => r.status === 'coded').length;
            const verifiedTerms = records.filter((r) => r.status === 'verified').length;
            const codingCompletionPercentage = ((codedTerms + verifiedTerms) / records.length) * 100;
            const verificationPercentage = (verifiedTerms / records.length) * 100;
            return {
                totalTerms: records.length,
                uncodedTerms,
                pendingTerms,
                codedTerms,
                verifiedTerms,
                codingCompletionPercentage: Math.round(codingCompletionPercentage * 100) / 100,
                verificationPercentage: Math.round(verificationPercentage * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error('Coding status metrics calculation failed', error);
            throw error;
        }
    }
    /**
     * Identify uncoded terms
     */
    identifyUncodedTerms(codingType) {
        try {
            let records = Array.from(this.codingRecords.values()).filter((r) => r.status === 'uncoded');
            if (codingType) {
                records = records.filter((r) => r.codingType === codingType);
            }
            return records;
        }
        catch (error) {
            this.logger.error('Uncoded terms identification failed', error);
            throw error;
        }
    }
    /**
     * Create a coding query
     */
    createCodingQuery(codingId, issue, severity) {
        try {
            const record = this.codingRecords.get(codingId);
            if (!record) {
                throw new Error(`Coding record not found: ${codingId}`);
            }
            const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const query = {
                queryId,
                codingId,
                term: record.term,
                issue,
                severity,
                status: 'open',
                createdDate: new Date(),
            };
            this.codingQueries.set(queryId, query);
            this.logger.info(`Coding query created: ${queryId}`);
            return query;
        }
        catch (error) {
            this.logger.error('Coding query creation failed', error);
            throw error;
        }
    }
    /**
     * Resolve a coding query
     */
    resolveCodingQuery(queryId) {
        try {
            const query = this.codingQueries.get(queryId);
            if (!query) {
                throw new Error(`Coding query not found: ${queryId}`);
            }
            query.status = 'resolved';
            query.resolvedDate = new Date();
            this.codingQueries.set(queryId, query);
            this.logger.info(`Coding query resolved: ${queryId}`);
            return query;
        }
        catch (error) {
            this.logger.error('Coding query resolution failed', error);
            throw error;
        }
    }
    /**
     * Get open coding queries
     */
    getOpenCodingQueries(codingType) {
        try {
            let queries = Array.from(this.codingQueries.values()).filter((q) => q.status === 'open');
            if (codingType) {
                const recordsOfType = Array.from(this.codingRecords.values())
                    .filter((r) => r.codingType === codingType)
                    .map((r) => r.codingId);
                queries = queries.filter((q) => recordsOfType.includes(q.codingId));
            }
            return queries;
        }
        catch (error) {
            this.logger.error('Open coding queries retrieval failed', error);
            throw error;
        }
    }
    /**
     * Get coding query summary
     */
    getCodingQuerySummary() {
        try {
            const queries = Array.from(this.codingQueries.values());
            return {
                total: queries.length,
                open: queries.filter((q) => q.status === 'open').length,
                resolved: queries.filter((q) => q.status === 'resolved').length,
                closed: queries.filter((q) => q.status === 'closed').length,
                critical: queries.filter((q) => q.severity === 'critical').length,
                high: queries.filter((q) => q.severity === 'high').length,
            };
        }
        catch (error) {
            this.logger.error('Coding query summary generation failed', error);
            throw error;
        }
    }
}
exports.CodingStatusComponent = CodingStatusComponent;
//# sourceMappingURL=CodingStatusComponent.js.map
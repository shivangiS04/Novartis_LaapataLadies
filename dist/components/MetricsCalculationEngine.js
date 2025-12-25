"use strict";
/**
 * Metrics Calculation Engine
 * Implements derived metrics for clinical trial data quality and operational tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCalculationEngine = void 0;
const logger_1 = require("../utils/logger");
class MetricsCalculationEngine {
    constructor() {
        this.logger = (0, logger_1.createLogger)('MetricsCalculationEngine');
    }
    /**
     * Calculate derived metrics for a patient
     */
    calculatePatientMetrics(patient, expectedVisits) {
        try {
            const visits = patient.clinicalData.visits || [];
            const missingVisits = Math.max(0, expectedVisits - visits.length);
            const missingVisitPercentage = (missingVisits / expectedVisits) * 100;
            // Calculate missing pages
            const totalPages = visits.reduce((sum, v) => sum + (v.forms?.length || 0), 0);
            const completedPages = visits.reduce((sum, v) => sum + (v.forms?.filter((f) => f.status === 'completed').length || 0), 0);
            const missingPages = Math.max(0, totalPages - completedPages);
            const missingPagePercentage = totalPages > 0 ? (missingPages / totalPages) * 100 : 0;
            // Calculate clean CRF percentage (forms without issues)
            const crfsWithoutQueries = visits.filter((v) => {
                const forms = v.forms || [];
                return forms.every((f) => f.status === 'completed');
            }).length;
            const cleanCRFPercentage = visits.length > 0 ? (crfsWithoutQueries / visits.length) * 100 : 0;
            // Calculate non-conformant data percentage
            const totalQualityIssues = patient.dataQualityFlags?.length || 0;
            const nonConformantDataPercentage = visits.length > 0 ? (totalQualityIssues / visits.length) * 100 : 0;
            // Calculate verification status percentage
            const verifiedVisits = visits.filter((v) => v.formStatus === 'completed').length;
            const verificationStatusPercentage = visits.length > 0 ? (verifiedVisits / visits.length) * 100 : 0;
            // Determine clean patient status
            const cleanPatientStatus = missingVisitPercentage === 0 &&
                missingPagePercentage === 0 &&
                totalQualityIssues === 0 &&
                verificationStatusPercentage === 100;
            // Calculate Data Quality Index (weighted)
            const dqi = this.calculateDataQualityIndex(missingVisitPercentage, missingPagePercentage, cleanCRFPercentage, nonConformantDataPercentage, verificationStatusPercentage);
            return {
                missingVisitPercentage,
                missingPagePercentage,
                cleanCRFPercentage,
                nonConformantDataPercentage,
                verificationStatusPercentage,
                cleanPatientStatus,
                dataQualityIndex: dqi,
            };
        }
        catch (error) {
            this.logger.error('Patient metrics calculation failed', error);
            throw error;
        }
    }
    /**
     * Calculate Data Quality Index with weighted scoring
     */
    calculateDataQualityIndex(missingVisitPct, missingPagePct, cleanCRFPct, nonConformantPct, verificationPct) {
        // Weights for each component
        const weights = {
            visitCompletion: 0.25,
            pageCompletion: 0.25,
            cleanCRF: 0.25,
            conformance: 0.15,
            verification: 0.1,
        };
        // Convert percentages to scores (0-100)
        const visitScore = 100 - missingVisitPct;
        const pageScore = 100 - missingPagePct;
        const crfScore = cleanCRFPct;
        const conformanceScore = 100 - nonConformantPct;
        const verificationScore = verificationPct;
        // Calculate weighted DQI
        const dqi = visitScore * weights.visitCompletion +
            pageScore * weights.pageCompletion +
            crfScore * weights.cleanCRF +
            conformanceScore * weights.conformance +
            verificationScore * weights.verification;
        return Math.round(dqi * 100) / 100; // Round to 2 decimal places
    }
    /**
     * Calculate site-level metrics
     */
    calculateSiteMetrics(patients, siteId, expectedVisitsPerPatient) {
        try {
            if (patients.length === 0) {
                return {
                    siteId,
                    totalPatients: 0,
                    averageMissingVisitPercentage: 0,
                    averageCleanCRFPercentage: 0,
                    averageDataQualityIndex: 0,
                    performanceRating: 'fair',
                };
            }
            const metrics = patients.map((p) => this.calculatePatientMetrics(p, expectedVisitsPerPatient));
            const averageMissingVisitPercentage = metrics.reduce((sum, m) => sum + m.missingVisitPercentage, 0) / metrics.length;
            const averageCleanCRFPercentage = metrics.reduce((sum, m) => sum + m.cleanCRFPercentage, 0) / metrics.length;
            const averageDataQualityIndex = metrics.reduce((sum, m) => sum + m.dataQualityIndex, 0) / metrics.length;
            const performanceRating = this.getPerformanceRating(averageDataQualityIndex);
            return {
                siteId,
                totalPatients: patients.length,
                averageMissingVisitPercentage,
                averageCleanCRFPercentage,
                averageDataQualityIndex,
                performanceRating,
            };
        }
        catch (error) {
            this.logger.error('Site metrics calculation failed', error);
            throw error;
        }
    }
    /**
     * Calculate trial-level metrics
     */
    calculateTrialMetrics(patients, studyId, siteCount, expectedVisitsPerPatient) {
        try {
            if (patients.length === 0) {
                return {
                    studyId,
                    totalPatients: 0,
                    totalSites: siteCount,
                    overallDataQualityIndex: 0,
                    readinessForInterimAnalysis: false,
                    readinessForSubmission: false,
                };
            }
            const metrics = patients.map((p) => this.calculatePatientMetrics(p, expectedVisitsPerPatient));
            const overallDataQualityIndex = metrics.reduce((sum, m) => sum + m.dataQualityIndex, 0) / metrics.length;
            // Readiness criteria
            const readinessForInterimAnalysis = overallDataQualityIndex >= 85 && this.checkDataCompleteness(patients, 0.9);
            const readinessForSubmission = overallDataQualityIndex >= 95 && this.checkDataCompleteness(patients, 0.98);
            return {
                studyId,
                totalPatients: patients.length,
                totalSites: siteCount,
                overallDataQualityIndex: Math.round(overallDataQualityIndex * 100) / 100,
                readinessForInterimAnalysis,
                readinessForSubmission,
            };
        }
        catch (error) {
            this.logger.error('Trial metrics calculation failed', error);
            throw error;
        }
    }
    /**
     * Check data completeness threshold
     */
    checkDataCompleteness(patients, threshold) {
        if (patients.length === 0)
            return false;
        const completePatients = patients.filter((p) => {
            const visits = p.clinicalData.visits || [];
            const completedVisits = visits.filter((v) => v.formStatus === 'completed').length;
            return visits.length > 0 && completedVisits / visits.length >= threshold;
        });
        return completePatients.length / patients.length >= threshold;
    }
    /**
     * Get performance rating based on DQI
     */
    getPerformanceRating(dqi) {
        if (dqi >= 90)
            return 'excellent';
        if (dqi >= 75)
            return 'good';
        if (dqi >= 60)
            return 'fair';
        return 'poor';
    }
    /**
     * Identify underperforming sites
     */
    identifyUnderperformingSites(siteMetrics, threshold = 70) {
        return siteMetrics.filter((s) => s.averageDataQualityIndex < threshold);
    }
    /**
     * Calculate deviation metrics
     */
    calculateDeviationMetrics(patients) {
        try {
            const deviations = patients.flatMap((p) => p.dataQualityFlags || []);
            const deviationCounts = {};
            deviations.forEach((d) => {
                deviationCounts[d.issueType] = (deviationCounts[d.issueType] || 0) + 1;
            });
            return deviationCounts;
        }
        catch (error) {
            this.logger.error('Deviation metrics calculation failed', error);
            throw error;
        }
    }
}
exports.MetricsCalculationEngine = MetricsCalculationEngine;
//# sourceMappingURL=MetricsCalculationEngine.js.map
"use strict";
/**
 * Advanced Analytics Engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngine = void 0;
const logger_1 = require("../utils/logger");
class AnalyticsEngine {
    constructor() {
        this.logger = (0, logger_1.createLogger)('AnalyticsEngine');
    }
    async computeStatistics(data, metrics) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                return {};
            }
            const stats = {};
            for (const metric of metrics) {
                const values = data
                    .filter((d) => typeof d === 'object' && d !== null && metric in d)
                    .map((d) => d[metric])
                    .filter((v) => typeof v === 'number');
                if (values.length > 0) {
                    stats[metric] = {
                        count: values.length,
                        mean: values.reduce((a, b) => a + b, 0) / values.length,
                        median: this.calculateMedian(values),
                        min: Math.min(...values),
                        max: Math.max(...values),
                        stdDev: this.calculateStdDev(values),
                        q1: this.calculatePercentile(values, 0.25),
                        q3: this.calculatePercentile(values, 0.75),
                    };
                }
            }
            return stats;
        }
        catch (error) {
            this.logger.error('Statistics computation failed', error);
            throw error;
        }
    }
    async analyzeTrends(timeSeries, window) {
        try {
            if (!Array.isArray(timeSeries) || timeSeries.length < 2) {
                return {};
            }
            const trends = {};
            const windowSize = Math.min(window, timeSeries.length);
            // Calculate moving average
            const values = timeSeries
                .filter((d) => typeof d === 'object' && d !== null && 'value' in d)
                .map((d) => d.value)
                .filter((v) => typeof v === 'number');
            if (values.length >= windowSize) {
                const movingAverages = [];
                for (let i = 0; i <= values.length - windowSize; i++) {
                    const window_values = values.slice(i, i + windowSize);
                    movingAverages.push(window_values.reduce((a, b) => a + b, 0) / windowSize);
                }
                // Determine trend direction
                const firstAvg = movingAverages[0];
                const lastAvg = movingAverages[movingAverages.length - 1];
                const change = ((lastAvg - firstAvg) / firstAvg) * 100;
                trends.direction = change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable';
                trends.changePercent = change;
                trends.movingAverages = movingAverages;
            }
            return trends;
        }
        catch (error) {
            this.logger.error('Trend analysis failed', error);
            throw error;
        }
    }
    async computeCohortComparisons(cohorts, variables) {
        try {
            const comparisons = {};
            for (const [cohortName, cohortData] of Object.entries(cohorts)) {
                const stats = await this.computeStatistics(cohortData, variables);
                comparisons[cohortName] = stats;
            }
            return comparisons;
        }
        catch (error) {
            this.logger.error('Cohort comparison failed', error);
            throw error;
        }
    }
    async identifyCorrelations(variables, threshold) {
        try {
            const correlations = {};
            // Placeholder for correlation analysis
            // In real implementation, would compute Pearson correlation coefficients
            correlations.threshold = threshold;
            correlations.variables = variables;
            correlations.correlationMatrix = {};
            return correlations;
        }
        catch (error) {
            this.logger.error('Correlation analysis failed', error);
            throw error;
        }
    }
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    calculateStdDev(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = percentile * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        if (lower === upper) {
            return sorted[lower];
        }
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
}
exports.AnalyticsEngine = AnalyticsEngine;
//# sourceMappingURL=AnalyticsEngine.js.map
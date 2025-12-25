/**
 * Advanced Analytics Engine
 */

import { IAdvancedAnalyticsEngine, ILogger } from '../interfaces/components';
import { createLogger } from '../utils/logger';

export class AnalyticsEngine implements IAdvancedAnalyticsEngine {
  private logger: ILogger;

  constructor() {
    this.logger = createLogger('AnalyticsEngine');
  }

  async computeStatistics(data: unknown[], metrics: string[]): Promise<Record<string, unknown>> {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return {};
      }

      const stats: Record<string, unknown> = {};

      for (const metric of metrics) {
        const values = data
          .filter((d) => typeof d === 'object' && d !== null && metric in (d as Record<string, unknown>))
          .map((d) => (d as Record<string, unknown>)[metric])
          .filter((v) => typeof v === 'number') as number[];

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
    } catch (error) {
      this.logger.error('Statistics computation failed', error as Error);
      throw error;
    }
  }

  async analyzeTrends(timeSeries: unknown[], window: number): Promise<Record<string, unknown>> {
    try {
      if (!Array.isArray(timeSeries) || timeSeries.length < 2) {
        return {};
      }

      const trends: Record<string, unknown> = {};
      const windowSize = Math.min(window, timeSeries.length);

      // Calculate moving average
      const values = timeSeries
        .filter((d) => typeof d === 'object' && d !== null && 'value' in (d as Record<string, unknown>))
        .map((d) => (d as Record<string, unknown>).value)
        .filter((v) => typeof v === 'number') as number[];

      if (values.length >= windowSize) {
        const movingAverages: number[] = [];
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
    } catch (error) {
      this.logger.error('Trend analysis failed', error as Error);
      throw error;
    }
  }

  async computeCohortComparisons(cohorts: Record<string, unknown[]>, variables: string[]): Promise<Record<string, unknown>> {
    try {
      const comparisons: Record<string, unknown> = {};

      for (const [cohortName, cohortData] of Object.entries(cohorts)) {
        const stats = await this.computeStatistics(cohortData, variables);
        comparisons[cohortName] = stats;
      }

      return comparisons;
    } catch (error) {
      this.logger.error('Cohort comparison failed', error as Error);
      throw error;
    }
  }

  async identifyCorrelations(variables: string[], threshold: number): Promise<Record<string, unknown>> {
    try {
      const correlations: Record<string, unknown> = {};

      // Placeholder for correlation analysis
      // In real implementation, would compute Pearson correlation coefficients
      correlations.threshold = threshold;
      correlations.variables = variables;
      correlations.correlationMatrix = {};

      return correlations;
    } catch (error) {
      this.logger.error('Correlation analysis failed', error as Error);
      throw error;
    }
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculatePercentile(values: number[], percentile: number): number {
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

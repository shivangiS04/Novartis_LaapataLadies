/**
 * Advanced Analytics Engine
 */
import { IAdvancedAnalyticsEngine } from '../interfaces/components';
export declare class AnalyticsEngine implements IAdvancedAnalyticsEngine {
    private logger;
    constructor();
    computeStatistics(data: unknown[], metrics: string[]): Promise<Record<string, unknown>>;
    analyzeTrends(timeSeries: unknown[], window: number): Promise<Record<string, unknown>>;
    computeCohortComparisons(cohorts: Record<string, unknown[]>, variables: string[]): Promise<Record<string, unknown>>;
    identifyCorrelations(variables: string[], threshold: number): Promise<Record<string, unknown>>;
    private calculateMedian;
    private calculateStdDev;
    private calculatePercentile;
}
//# sourceMappingURL=AnalyticsEngine.d.ts.map
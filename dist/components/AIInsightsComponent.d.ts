/**
 * AI Insights and Recommendations Component
 */
import { IAIInsightsComponent } from '../interfaces/components';
import { Insight, DataQualityIssue, Alert } from '../types/index';
export declare class AIInsightsComponent implements IAIInsightsComponent {
    private logger;
    constructor();
    generateInsight(data: unknown, context: Record<string, unknown>, insightType: string): Promise<Insight>;
    generateRecommendation(problem: Record<string, unknown>, historicalPatterns: unknown[]): Promise<Record<string, unknown>>;
    summarizeIssue(issue: DataQualityIssue | Alert): Promise<string>;
    rankInsights(insights: Insight[]): Promise<Insight[]>;
    private generateTitle;
    private generateDescription;
    private calculateConfidence;
    private assessImpact;
    private assessUrgency;
    private generateActions;
    private calculateSimilarity;
}
//# sourceMappingURL=AIInsightsComponent.d.ts.map
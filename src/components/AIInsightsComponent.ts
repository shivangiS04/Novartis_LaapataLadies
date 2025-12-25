/**
 * AI Insights and Recommendations Component
 */

import { IAIInsightsComponent, ILogger } from '../interfaces/components';
import { Insight, InsightType, SeverityLevel, DataQualityIssue, Alert, Action } from '../types/index';
import { InsightModel } from '../models/Insight';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AIInsightsComponent implements IAIInsightsComponent {
  private logger: ILogger;

  constructor() {
    this.logger = createLogger('AIInsightsComponent');
  }

  async generateInsight(data: unknown, context: Record<string, unknown>, insightType: string): Promise<Insight> {
    try {
      this.logger.info('Generating insight', { insightType });

      const insight = new InsightModel({
        insightId: uuidv4(),
        type: insightType as InsightType,
        title: this.generateTitle(insightType),
        description: this.generateDescription(insightType, context),
        supportingData: data as Record<string, unknown>,
        confidence: this.calculateConfidence(data),
        impact: this.assessImpact(context),
        urgency: this.assessUrgency(context),
        recommendedActions: this.generateActions(context),
        generatedDate: new Date(),
        generatedBy: 'AIInsightsComponent',
      });

      return insight;
    } catch (error) {
      this.logger.error('Insight generation failed', error as Error);
      throw error;
    }
  }

  async generateRecommendation(problem: Record<string, unknown>, historicalPatterns: unknown[]): Promise<Record<string, unknown>> {
    try {
      this.logger.info('Generating recommendation', { problem });

      const recommendations: Record<string, unknown>[] = [];

      // Analyze historical patterns
      if (Array.isArray(historicalPatterns) && historicalPatterns.length > 0) {
        const patterns = historicalPatterns.filter((p) => typeof p === 'object' && p !== null);

        // Find similar patterns
        for (const pattern of patterns) {
          const similarity = this.calculateSimilarity(problem, pattern as Record<string, unknown>);
          if (similarity > 0.7) {
            recommendations.push({
              action: `Apply solution from similar case with ${(similarity * 100).toFixed(1)}% similarity`,
              confidence: similarity,
              source: 'historical_pattern',
            });
          }
        }
      }

      // Generate AI-based recommendations
      recommendations.push({
        action: 'Investigate root cause',
        confidence: 0.9,
        source: 'ai_analysis',
      });

      return {
        recommendations,
        totalRecommendations: recommendations.length,
        bestRecommendation: recommendations[0],
      };
    } catch (error) {
      this.logger.error('Recommendation generation failed', error as Error);
      throw error;
    }
  }

  async summarizeIssue(issue: DataQualityIssue | Alert): Promise<string> {
    try {
      this.logger.info('Summarizing issue');

      if ('issueType' in issue) {
        // DataQualityIssue
        const dqIssue = issue as DataQualityIssue;
        return `Data Quality Issue: ${dqIssue.issueType} detected in field ${dqIssue.affectedField}. ` +
          `Severity: ${dqIssue.severity}. Description: ${dqIssue.description}`;
      } else {
        // Alert
        const alert = issue as Alert;
        return `Alert: ${alert.title}. Type: ${alert.type}. Severity: ${alert.severity}. ` +
          `Affected Records: ${alert.affectedRecords.length}. Status: ${alert.status}`;
      }
    } catch (error) {
      this.logger.error('Issue summarization failed', error as Error);
      throw error;
    }
  }

  async rankInsights(insights: Insight[]): Promise<Insight[]> {
    try {
      this.logger.info('Ranking insights', { count: insights.length });

      const ranked = [...insights].sort((a, b) => {
        const scoreA = (a as any).getPriorityScore?.() ?? 0;
        const scoreB = (b as any).getPriorityScore?.() ?? 0;
        return scoreB - scoreA;
      });

      return ranked;
    } catch (error) {
      this.logger.error('Insight ranking failed', error as Error);
      throw error;
    }
  }

  private generateTitle(insightType: string): string {
    const titles: Record<string, string> = {
      data_quality: 'Data Quality Issue Detected',
      operational: 'Operational Bottleneck Identified',
      clinical: 'Clinical Pattern Identified',
      predictive: 'Predictive Alert Generated',
    };

    return titles[insightType] || 'New Insight Generated';
  }

  private generateDescription(insightType: string, context: Record<string, unknown>): string {
    const descriptions: Record<string, string> = {
      data_quality: `Data quality issues have been detected. ${JSON.stringify(context).substring(0, 100)}...`,
      operational: `Operational inefficiencies identified. ${JSON.stringify(context).substring(0, 100)}...`,
      clinical: `Clinical patterns detected in the data. ${JSON.stringify(context).substring(0, 100)}...`,
      predictive: `Predictive analysis suggests potential issues. ${JSON.stringify(context).substring(0, 100)}...`,
    };

    return descriptions[insightType] || 'An insight has been generated based on available data.';
  }

  private calculateConfidence(data: unknown): number {
    // Simple confidence calculation based on data completeness
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      const filledFields = Object.values(obj).filter((v) => v !== null && v !== undefined).length;
      const totalFields = Object.keys(obj).length;
      return totalFields > 0 ? filledFields / totalFields : 0.5;
    }
    return 0.5;
  }

  private assessImpact(context: Record<string, unknown>): SeverityLevel {
    const severity = context.severity as string;
    if (severity === 'critical' || severity === 'high') {
      return 'high';
    }
    return 'medium';
  }

  private assessUrgency(context: Record<string, unknown>): SeverityLevel {
    const urgency = context.urgency as string;
    if (urgency === 'critical') {
      return 'critical';
    }
    return 'high';
  }

  private generateActions(context: Record<string, unknown>): Action[] {
    const actions: Action[] = [];

    actions.push({
      actionId: uuidv4(),
      title: 'Review and Investigate',
      description: 'Review the identified issue and investigate root cause',
      priority: 'high',
      estimatedImpact: 'Identify root cause',
    });

    actions.push({
      actionId: uuidv4(),
      title: 'Take Corrective Action',
      description: 'Implement corrective measures based on findings',
      priority: 'high',
      estimatedImpact: 'Resolve the issue',
    });

    return actions;
  }

  private calculateSimilarity(obj1: Record<string, unknown>, obj2: Record<string, unknown>): number {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const commonKeys = keys1.filter((k) => keys2.includes(k));

    if (commonKeys.length === 0) {
      return 0;
    }

    let matches = 0;
    for (const key of commonKeys) {
      if (obj1[key] === obj2[key]) {
        matches++;
      }
    }

    return matches / Math.max(keys1.length, keys2.length);
  }
}

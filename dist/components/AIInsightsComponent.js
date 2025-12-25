"use strict";
/**
 * AI Insights and Recommendations Component
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsComponent = void 0;
const Insight_1 = require("../models/Insight");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class AIInsightsComponent {
    constructor() {
        this.logger = (0, logger_1.createLogger)('AIInsightsComponent');
    }
    async generateInsight(data, context, insightType) {
        try {
            this.logger.info('Generating insight', { insightType });
            const insight = new Insight_1.InsightModel({
                insightId: (0, uuid_1.v4)(),
                type: insightType,
                title: this.generateTitle(insightType),
                description: this.generateDescription(insightType, context),
                supportingData: data,
                confidence: this.calculateConfidence(data),
                impact: this.assessImpact(context),
                urgency: this.assessUrgency(context),
                recommendedActions: this.generateActions(context),
                generatedDate: new Date(),
                generatedBy: 'AIInsightsComponent',
            });
            return insight;
        }
        catch (error) {
            this.logger.error('Insight generation failed', error);
            throw error;
        }
    }
    async generateRecommendation(problem, historicalPatterns) {
        try {
            this.logger.info('Generating recommendation', { problem });
            const recommendations = [];
            // Analyze historical patterns
            if (Array.isArray(historicalPatterns) && historicalPatterns.length > 0) {
                const patterns = historicalPatterns.filter((p) => typeof p === 'object' && p !== null);
                // Find similar patterns
                for (const pattern of patterns) {
                    const similarity = this.calculateSimilarity(problem, pattern);
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
        }
        catch (error) {
            this.logger.error('Recommendation generation failed', error);
            throw error;
        }
    }
    async summarizeIssue(issue) {
        try {
            this.logger.info('Summarizing issue');
            if ('issueType' in issue) {
                // DataQualityIssue
                const dqIssue = issue;
                return `Data Quality Issue: ${dqIssue.issueType} detected in field ${dqIssue.affectedField}. ` +
                    `Severity: ${dqIssue.severity}. Description: ${dqIssue.description}`;
            }
            else {
                // Alert
                const alert = issue;
                return `Alert: ${alert.title}. Type: ${alert.type}. Severity: ${alert.severity}. ` +
                    `Affected Records: ${alert.affectedRecords.length}. Status: ${alert.status}`;
            }
        }
        catch (error) {
            this.logger.error('Issue summarization failed', error);
            throw error;
        }
    }
    async rankInsights(insights) {
        try {
            this.logger.info('Ranking insights', { count: insights.length });
            const ranked = [...insights].sort((a, b) => {
                const scoreA = a.getPriorityScore?.() ?? 0;
                const scoreB = b.getPriorityScore?.() ?? 0;
                return scoreB - scoreA;
            });
            return ranked;
        }
        catch (error) {
            this.logger.error('Insight ranking failed', error);
            throw error;
        }
    }
    generateTitle(insightType) {
        const titles = {
            data_quality: 'Data Quality Issue Detected',
            operational: 'Operational Bottleneck Identified',
            clinical: 'Clinical Pattern Identified',
            predictive: 'Predictive Alert Generated',
        };
        return titles[insightType] || 'New Insight Generated';
    }
    generateDescription(insightType, context) {
        const descriptions = {
            data_quality: `Data quality issues have been detected. ${JSON.stringify(context).substring(0, 100)}...`,
            operational: `Operational inefficiencies identified. ${JSON.stringify(context).substring(0, 100)}...`,
            clinical: `Clinical patterns detected in the data. ${JSON.stringify(context).substring(0, 100)}...`,
            predictive: `Predictive analysis suggests potential issues. ${JSON.stringify(context).substring(0, 100)}...`,
        };
        return descriptions[insightType] || 'An insight has been generated based on available data.';
    }
    calculateConfidence(data) {
        // Simple confidence calculation based on data completeness
        if (typeof data === 'object' && data !== null) {
            const obj = data;
            const filledFields = Object.values(obj).filter((v) => v !== null && v !== undefined).length;
            const totalFields = Object.keys(obj).length;
            return totalFields > 0 ? filledFields / totalFields : 0.5;
        }
        return 0.5;
    }
    assessImpact(context) {
        const severity = context.severity;
        if (severity === 'critical' || severity === 'high') {
            return 'high';
        }
        return 'medium';
    }
    assessUrgency(context) {
        const urgency = context.urgency;
        if (urgency === 'critical') {
            return 'critical';
        }
        return 'high';
    }
    generateActions(context) {
        const actions = [];
        actions.push({
            actionId: (0, uuid_1.v4)(),
            title: 'Review and Investigate',
            description: 'Review the identified issue and investigate root cause',
            priority: 'high',
            estimatedImpact: 'Identify root cause',
        });
        actions.push({
            actionId: (0, uuid_1.v4)(),
            title: 'Take Corrective Action',
            description: 'Implement corrective measures based on findings',
            priority: 'high',
            estimatedImpact: 'Resolve the issue',
        });
        return actions;
    }
    calculateSimilarity(obj1, obj2) {
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
exports.AIInsightsComponent = AIInsightsComponent;
//# sourceMappingURL=AIInsightsComponent.js.map
/**
 * Insight Model
 */
import { Insight, InsightType, SeverityLevel, Action } from '../types/index';
import { ValidationResult } from '../types/index';
export declare class InsightModel implements Insight {
    insightId: string;
    type: InsightType;
    title: string;
    description: string;
    supportingData: Record<string, unknown>;
    confidence: number;
    impact: SeverityLevel;
    urgency: SeverityLevel;
    recommendedActions: Action[];
    generatedDate: Date;
    generatedBy: string;
    constructor(data: Partial<Insight>);
    validate(): ValidationResult;
    addAction(action: Action): void;
    getPriorityScore(): number;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Insight.d.ts.map
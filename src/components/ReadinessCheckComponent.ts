/**
 * Readiness Check Component
 * Automated readiness checks for interim analysis and submission
 */

import { ILogger } from '../interfaces/components';
import { createLogger } from '../utils/logger';
import { Patient } from '../types/index';

export interface ReadinessCriteria {
  minDataQualityIndex: number;
  minDataCompleteness: number;
  maxOpenQueries: number;
  maxCriticalIssues: number;
  requiredVerificationPercentage: number;
}

export interface ReadinessCheckResult {
  checkType: 'interim_analysis' | 'submission';
  isReady: boolean;
  overallScore: number;
  criteria: ReadinessCriteriaResult[];
  issues: ReadinessIssue[];
  recommendations: string[];
  checkedDate: Date;
}

export interface ReadinessCriteriaResult {
  criteriaName: string;
  required: number | string;
  actual: number | string;
  isMet: boolean;
  severity: 'critical' | 'high' | 'warning' | 'info';
}

export interface ReadinessIssue {
  issueId: string;
  category: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedCount: number;
  recommendation: string;
}

export class ReadinessCheckComponent {
  private logger: ILogger;

  // Default criteria for interim analysis
  private interimAnalysisCriteria: ReadinessCriteria = {
    minDataQualityIndex: 85,
    minDataCompleteness: 0.9,
    maxOpenQueries: 50,
    maxCriticalIssues: 5,
    requiredVerificationPercentage: 80,
  };

  // Default criteria for submission
  private submissionCriteria: ReadinessCriteria = {
    minDataQualityIndex: 95,
    minDataCompleteness: 0.98,
    maxOpenQueries: 5,
    maxCriticalIssues: 0,
    requiredVerificationPercentage: 100,
  };

  constructor() {
    this.logger = createLogger('ReadinessCheckComponent');
  }

  /**
   * Check readiness for interim analysis
   */
  checkInterimAnalysisReadiness(patients: Patient[], metrics: Record<string, number>): ReadinessCheckResult {
    try {
      return this.performReadinessCheck(patients, metrics, 'interim_analysis', this.interimAnalysisCriteria);
    } catch (error) {
      this.logger.error('Interim analysis readiness check failed', error as Error);
      throw error;
    }
  }

  /**
   * Check readiness for submission
   */
  checkSubmissionReadiness(patients: Patient[], metrics: Record<string, number>): ReadinessCheckResult {
    try {
      return this.performReadinessCheck(patients, metrics, 'submission', this.submissionCriteria);
    } catch (error) {
      this.logger.error('Submission readiness check failed', error as Error);
      throw error;
    }
  }

  /**
   * Perform readiness check with given criteria
   */
  private performReadinessCheck(
    patients: Patient[],
    metrics: Record<string, number>,
    checkType: 'interim_analysis' | 'submission',
    criteria: ReadinessCriteria
  ): ReadinessCheckResult {
    try {
      const criteriaResults: ReadinessCriteriaResult[] = [];
      const issues: ReadinessIssue[] = [];
      let passedCriteria = 0;

      // Check Data Quality Index
      const dqi = metrics.dataQualityIndex || 0;
      const dqiMet = dqi >= criteria.minDataQualityIndex;
      criteriaResults.push({
        criteriaName: 'Data Quality Index',
        required: criteria.minDataQualityIndex,
        actual: Math.round(dqi * 100) / 100,
        isMet: dqiMet,
        severity: dqiMet ? 'info' : 'critical',
      });
      if (dqiMet) passedCriteria++;
      else {
        issues.push({
          issueId: `issue_dqi_${Date.now()}`,
          category: 'Data Quality',
          description: `Data Quality Index (${dqi}) is below required threshold (${criteria.minDataQualityIndex})`,
          severity: 'critical',
          affectedCount: patients.length,
          recommendation: 'Resolve data quality issues and rerun validation',
        });
      }

      // Check Data Completeness
      const completeness = this.calculateDataCompleteness(patients);
      const completenessMet = completeness >= criteria.minDataCompleteness;
      criteriaResults.push({
        criteriaName: 'Data Completeness',
        required: `${criteria.minDataCompleteness * 100}%`,
        actual: `${Math.round(completeness * 10000) / 100}%`,
        isMet: completenessMet,
        severity: completenessMet ? 'info' : 'critical',
      });
      if (completenessMet) passedCriteria++;
      else {
        const incompleteCount = Math.round(patients.length * (1 - completeness));
        issues.push({
          issueId: `issue_completeness_${Date.now()}`,
          category: 'Data Completeness',
          description: `${incompleteCount} patients have incomplete data`,
          severity: 'critical',
          affectedCount: incompleteCount,
          recommendation: 'Complete missing visits and forms',
        });
      }

      // Check Open Queries
      const openQueries = this.countOpenQueries(patients);
      const queriesMet = openQueries <= criteria.maxOpenQueries;
      criteriaResults.push({
        criteriaName: 'Open Queries',
        required: `≤ ${criteria.maxOpenQueries}`,
        actual: openQueries,
        isMet: queriesMet,
        severity: queriesMet ? 'info' : 'high',
      });
      if (queriesMet) passedCriteria++;
      else {
        issues.push({
          issueId: `issue_queries_${Date.now()}`,
          category: 'Open Queries',
          description: `${openQueries} open queries exceed threshold (${criteria.maxOpenQueries})`,
          severity: 'high',
          affectedCount: openQueries,
          recommendation: 'Resolve open queries before proceeding',
        });
      }

      // Check Critical Issues
      const criticalIssues = this.countCriticalIssues(patients);
      const criticalMet = criticalIssues <= criteria.maxCriticalIssues;
      criteriaResults.push({
        criteriaName: 'Critical Issues',
        required: `≤ ${criteria.maxCriticalIssues}`,
        actual: criticalIssues,
        isMet: criticalMet,
        severity: criticalMet ? 'info' : 'critical',
      });
      if (criticalMet) passedCriteria++;
      else {
        issues.push({
          issueId: `issue_critical_${Date.now()}`,
          category: 'Critical Issues',
          description: `${criticalIssues} critical issues must be resolved`,
          severity: 'critical',
          affectedCount: criticalIssues,
          recommendation: 'Address all critical data quality issues',
        });
      }

      // Check Verification Status
      const verificationPercentage = this.calculateVerificationPercentage(patients);
      const verificationMet = verificationPercentage >= criteria.requiredVerificationPercentage;
      criteriaResults.push({
        criteriaName: 'Verification Status',
        required: `${criteria.requiredVerificationPercentage}%`,
        actual: `${Math.round(verificationPercentage * 100) / 100}%`,
        isMet: verificationMet,
        severity: verificationMet ? 'info' : 'high',
      });
      if (verificationMet) passedCriteria++;
      else {
        const unverifiedCount = Math.round(patients.length * (1 - verificationPercentage / 100));
        issues.push({
          issueId: `issue_verification_${Date.now()}`,
          category: 'Verification',
          description: `${unverifiedCount} patients have unverified data`,
          severity: 'high',
          affectedCount: unverifiedCount,
          recommendation: 'Complete source data verification for all patients',
        });
      }

      // Calculate overall score
      const overallScore = (passedCriteria / criteriaResults.length) * 100;
      const isReady = passedCriteria === criteriaResults.length;

      // Generate recommendations
      const recommendations = this.generateRecommendations(issues, checkType);

      return {
        checkType,
        isReady,
        overallScore: Math.round(overallScore * 100) / 100,
        criteria: criteriaResults,
        issues,
        recommendations,
        checkedDate: new Date(),
      };
    } catch (error) {
      this.logger.error('Readiness check failed', error as Error);
      throw error;
    }
  }

  /**
   * Calculate data completeness
   */
  private calculateDataCompleteness(patients: Patient[]): number {
    if (patients.length === 0) return 0;

    const completePatients = patients.filter((p) => {
      const visits = p.clinicalData.visits || [];
      if (visits.length === 0) return false;
      const completedVisits = visits.filter((v) => v.formStatus === 'completed').length;
      return completedVisits / visits.length >= 0.95;
    });

    return completePatients.length / patients.length;
  }

  /**
   * Count open queries
   */
  private countOpenQueries(patients: Patient[]): number {
    return patients.reduce((sum, p) => {
      const openIssues = (p.dataQualityFlags || []).filter((f) => !f.resolvedDate).length;
      return sum + openIssues;
    }, 0);
  }

  /**
   * Count critical issues
   */
  private countCriticalIssues(patients: Patient[]): number {
    return patients.reduce((sum, p) => {
      const criticalIssues = (p.dataQualityFlags || []).filter((f) => f.severity === 'critical' && !f.resolvedDate).length;
      return sum + criticalIssues;
    }, 0);
  }

  /**
   * Calculate verification percentage
   */
  private calculateVerificationPercentage(patients: Patient[]): number {
    if (patients.length === 0) return 0;

    const verifiedPatients = patients.filter((p) => {
      const visits = p.clinicalData.visits || [];
      if (visits.length === 0) return false;
      return visits.every((v) => v.formStatus === 'completed');
    });

    return (verifiedPatients.length / patients.length) * 100;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(issues: ReadinessIssue[], checkType: string): string[] {
    const recommendations: string[] = [];

    const criticalIssues = issues.filter((i) => i.severity === 'critical');
    const highIssues = issues.filter((i) => i.severity === 'high');

    if (criticalIssues.length > 0) {
      recommendations.push(`Resolve ${criticalIssues.length} critical issue(s) before proceeding`);
    }

    if (highIssues.length > 0) {
      recommendations.push(`Address ${highIssues.length} high-priority issue(s)`);
    }

    if (checkType === 'submission') {
      recommendations.push('Perform final data lock and freeze all records');
      recommendations.push('Generate final audit trail report');
    } else {
      recommendations.push('Schedule interim analysis meeting');
      recommendations.push('Prepare interim analysis dataset');
    }

    return recommendations;
  }

  /**
   * Set custom criteria
   */
  setInterimAnalysisCriteria(criteria: Partial<ReadinessCriteria>): void {
    this.interimAnalysisCriteria = { ...this.interimAnalysisCriteria, ...criteria };
  }

  /**
   * Set custom submission criteria
   */
  setSubmissionCriteria(criteria: Partial<ReadinessCriteria>): void {
    this.submissionCriteria = { ...this.submissionCriteria, ...criteria };
  }
}

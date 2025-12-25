/**
 * Component Interfaces for Clinical Trial Data Integration System
 */

import {
  DataQualityIssue,
  OperationalMetric,
  Insight,
  Alert,
  DataSource,
  ValidationResult,
  PaginationParams,
  PaginatedResponse,
} from '../types/index';

// Data Ingestion Component Interface
export interface IDataIngestionComponent {
  ingestData(sourceId: string, dataPayload: unknown, metadata: Record<string, unknown>): Promise<string>;
  registerDataSource(sourceConfig: DataSource): Promise<void>;
  validateSchema(data: unknown, schema: Record<string, unknown>): Promise<ValidationResult>;
  getRegisteredSources(): Promise<DataSource[]>;
}

// Data Harmonization Component Interface
export interface IDataHarmonizationComponent {
  harmonizeData(rawData: unknown, harmonizationRules: Record<string, unknown>): Promise<unknown>;
  deduplicateRecords(records: unknown[], matchingRules: Record<string, unknown>): Promise<unknown[]>;
  mergeRecords(record1: unknown, record2: unknown, mergeStrategy: string): Promise<unknown>;
  getHarmonizationRules(): Promise<Record<string, unknown>>;
}

// Data Quality Monitoring Component Interface
export interface IDataQualityComponent {
  validateDataQuality(data: unknown, rules: Record<string, unknown>): Promise<DataQualityIssue[]>;
  detectAnomalies(data: unknown, historicalPatterns: unknown[]): Promise<DataQualityIssue[]>;
  generateAlert(issue: DataQualityIssue, severity: string, stakeholders: string[]): Promise<Alert>;
  trackResolution(alertId: string, resolution: string): Promise<void>;
  getQualityMetrics(params: PaginationParams): Promise<PaginatedResponse<DataQualityIssue>>;
}

// Operational Analytics Component Interface
export interface IOperationalAnalyticsComponent {
  analyzeOperationalMetrics(metrics: OperationalMetric[], timeWindow: { start: Date; end: Date }): Promise<unknown>;
  compareSitePerformance(sites: string[], metrics: string[]): Promise<Record<string, unknown>>;
  predictBottlenecks(historicalData: OperationalMetric[], currentTrends: OperationalMetric[]): Promise<Insight[]>;
  identifyBestPractices(highPerformers: string[]): Promise<Record<string, unknown>>;
}

// Advanced Analytics Engine Interface
export interface IAdvancedAnalyticsEngine {
  computeStatistics(data: unknown[], metrics: string[]): Promise<Record<string, unknown>>;
  analyzeTrends(timeSeries: unknown[], window: number): Promise<Record<string, unknown>>;
  computeCohortComparisons(cohorts: Record<string, unknown[]>, variables: string[]): Promise<Record<string, unknown>>;
  identifyCorrelations(variables: string[], threshold: number): Promise<Record<string, unknown>>;
}

// AI Insights and Recommendations Component Interface
export interface IAIInsightsComponent {
  generateInsight(data: unknown, context: Record<string, unknown>, insightType: string): Promise<Insight>;
  generateRecommendation(problem: Record<string, unknown>, historicalPatterns: unknown[]): Promise<Record<string, unknown>>;
  summarizeIssue(issue: DataQualityIssue | Alert, context: Record<string, unknown>): Promise<string>;
  rankInsights(insights: Insight[], criteria: Record<string, unknown>): Promise<Insight[]>;
}

// Visualization and Reporting Component Interface
export interface IVisualizationComponent {
  generateDashboard(userId: string, role: string): Promise<Record<string, unknown>>;
  generateReport(reportType: string, filters: Record<string, unknown>, format: string): Promise<string>;
  updateVisualization(data: unknown, visualizationType: string): Promise<Record<string, unknown>>;
  applyFilters(data: unknown[], filterCriteria: Record<string, unknown>): Promise<unknown[]>;
}

// Security and Access Control Component Interface
export interface ISecurityComponent {
  authenticateUser(credentials: { username: string; password: string }): Promise<{ token: string; userId: string }>;
  authorizeAccess(userId: string, resource: string, action: string): Promise<boolean>;
  encryptData(data: unknown, encryptionKey: string): Promise<string>;
  logAuditEvent(event: Record<string, unknown>, user: string, timestamp: Date): Promise<void>;
  maskSensitiveData(data: unknown, userRole: string): Promise<unknown>;
}

// Data Storage Interface
export interface IDataStorage {
  save<T>(collection: string, data: T): Promise<string>;
  retrieve<T>(collection: string, id: string): Promise<T | null>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  query<T>(collection: string, filters: Record<string, unknown>, params: PaginationParams): Promise<PaginatedResponse<T>>;
}

// Event Bus Interface
export interface IEventBus {
  publish(eventType: string, payload: Record<string, unknown>): Promise<void>;
  subscribe(eventType: string, handler: (payload: Record<string, unknown>) => Promise<void>): void;
  unsubscribe(eventType: string, handler: (payload: Record<string, unknown>) => Promise<void>): void;
}

// Logger Interface
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

/**
 * Core Type Definitions for Clinical Trial Data Integration System
 */

// Data Quality Issue Types
export type DataQualityIssueType = 'missing_value' | 'invalid_format' | 'inconsistency' | 'anomaly';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'closed';
export type FormStatus = 'planned' | 'in-progress' | 'completed' | 'missing';
export type InsightType = 'data_quality' | 'operational' | 'clinical' | 'predictive';
export type TrendDirection = 'improving' | 'stable' | 'declining';

// Core Interfaces
export interface Patient {
  patientId: string;
  studyId: string;
  demographics: {
    age: number;
    gender: string;
    enrollmentDate: Date;
  };
  clinicalData: {
    visits: Visit[];
    labResults: LabResult[];
    adverseEvents: AdverseEvent[];
    medications: Medication[];
  };
  dataQualityFlags: DataQualityIssue[];
  lastUpdated: Date;
  dataSource: string;
}

export interface Visit {
  visitId: string;
  patientId: string;
  visitType: string;
  scheduledDate: Date;
  actualDate?: Date;
  formStatus: FormStatus;
  forms: Form[];
  completionPercentage: number;
  delayDays: number;
  lastUpdated: Date;
}

export interface Form {
  formId: string;
  formName: string;
  status: FormStatus;
  completionPercentage: number;
  lastUpdated: Date;
}

export interface LabResult {
  labResultId: string;
  patientId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  abnormalFlag: boolean;
  labName: string;
  resultDate: Date;
  reportedDate: Date;
  dataQualityIssues: string[];
}

export interface AdverseEvent {
  eventId: string;
  patientId: string;
  eventType: string;
  severity: SeverityLevel;
  onsetDate: Date;
  resolutionDate?: Date;
  description: string;
}

export interface Medication {
  medicationId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  startDate: Date;
  endDate?: Date;
  route: string;
}

export interface DataQualityIssue {
  issueId: string;
  recordId: string;
  issueType: DataQualityIssueType;
  severity: SeverityLevel;
  description: string;
  affectedField: string;
  detectedDate: Date;
  resolvedDate?: Date;
  resolution?: string;
  resolutionTime?: number;
}

export interface OperationalMetric {
  metricId: string;
  siteId: string;
  metricType: string;
  value: number;
  unit: string;
  timeWindow: {
    start: Date;
    end: Date;
  };
  benchmark: number;
  variance: number;
  trend: TrendDirection;
}

export interface Insight {
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
}

export interface Action {
  actionId: string;
  title: string;
  description: string;
  priority: SeverityLevel;
  estimatedImpact: string;
}

export interface Alert {
  alertId: string;
  type: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  affectedRecords: string[];
  relatedIssues: string[];
  assignedTo: string[];
  status: AlertStatus;
  createdDate: Date;
  resolvedDate?: Date;
  resolutionNotes?: string;
}

export interface DataSource {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  endpoint?: string;
  schemaMapping: Record<string, string>;
  isActive: boolean;
  lastSync?: Date;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
}

export type UserRole = 'admin' | 'ctt' | 'cra' | 'site_coordinator' | 'viewer';

export interface Permission {
  permissionId: string;
  resource: string;
  action: string;
  granted: boolean;
}

export interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

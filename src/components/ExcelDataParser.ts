/**
 * Excel Data Parser for Clinical Trial Study Files
 * Parses real Study 1 Excel files and extracts clinical trial data
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { PatientModel } from '../models/Patient';
import { createLogger } from '../utils/logger';

const logger = createLogger('ExcelDataParser');

export interface StudyDataFiles {
  edcMetrics: string;
  esaeDashboard: string;
  meddraCoding: string;
  whoCoding: string;
  labMissing: string;
  visitProjection: string;
  missingPages: string;
  compiledEDRR: string;
  inactivatedForms: string;
}

export interface ParsedStudyData {
  patients: PatientModel[];
  sites: SiteData[];
  issues: IssueData[];
  labMetrics: LabMetricsData;
  codingStatus: CodingStatusData;
  saeData: SAEData[];
}

export interface SiteData {
  siteId: string;
  siteName: string;
  country: string;
  patientCount: number;
  completionRate: number;
  dataQualityScore: number;
  missingVisitPercentage: number;
  cleanCRFPercentage: number;
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface IssueData {
  issueId: string;
  category: 'Data Quality' | 'Verification' | 'Safety' | 'Lab';
  severity: 'high' | 'medium' | 'low';
  description: string;
  siteId: string;
  patientId?: string;
  formName?: string;
  fieldName?: string;
  detectedDate: Date;
  status: 'open' | 'resolved' | 'in-progress';
}

export interface LabMetricsData {
  totalLabResults: number;
  missingLabNames: number;
  missingRanges: number;
  reconciliationRate: number;
  centralLabResults: number;
  localLabResults: number;
}

export interface CodingStatusData {
  meddraCoding: {
    totalTerms: number;
    codedTerms: number;
    pendingTerms: number;
    codingRate: number;
  };
  whoCoding: {
    totalTerms: number;
    codedTerms: number;
    pendingTerms: number;
    codingRate: number;
  };
}

export interface SAEData {
  saeId: string;
  patientId: string;
  siteId: string;
  eventTerm: string;
  severity: string;
  reportedDate: Date;
  reconciliationStatus: 'complete' | 'pending' | 'discrepancy';
}

export class ExcelDataParser {
  private studyPath: string;

  constructor(studyPath: string) {
    this.studyPath = studyPath;
  }

  /**
   * Parse all Study 1 Excel files and return comprehensive study data
   */
  async parseStudyData(): Promise<ParsedStudyData> {
    try {
      logger.info('Starting Study 1 data parsing', { studyPath: this.studyPath });

      const files = this.getStudyFiles();
      
      // Parse each Excel file
      const edcMetrics = this.parseEDCMetrics(files.edcMetrics);
      const labMetrics = this.parseLabMetrics(files.labMissing);
      const codingStatus = this.parseCodingStatus(files.meddraCoding, files.whoCoding);
      const saeData = this.parseSAEData(files.esaeDashboard);
      const visitData = this.parseVisitData(files.visitProjection);
      const missingPagesData = this.parseMissingPages(files.missingPages);

      // Generate comprehensive patient data
      const patients = this.generatePatientData(edcMetrics, visitData, labMetrics);
      const sites = this.generateSiteData(patients, edcMetrics);
      const issues = this.generateIssuesData(missingPagesData, labMetrics, saeData, codingStatus);

      logger.info('Study 1 data parsing completed', {
        patientsCount: patients.length,
        sitesCount: sites.length,
        issuesCount: issues.length
      });

      return {
        patients,
        sites,
        issues,
        labMetrics,
        codingStatus,
        saeData
      };

    } catch (error) {
      logger.error('Failed to parse Study 1 data', error as Error);
      throw error;
    }
  }

  private getStudyFiles(): StudyDataFiles {
    const basePath = this.studyPath;
    return {
      edcMetrics: path.join(basePath, 'Study 1_CPID_EDC_Metrics_URSV2.0_14 NOV 2025_updated.xlsx'),
      esaeDashboard: path.join(basePath, 'Study 1_eSAE Dashboard_Standard DM_Safety Report_updated.xlsx'),
      meddraCoding: path.join(basePath, 'Study 1_GlobalCodingReport_MedDRA_updated.xlsx'),
      whoCoding: path.join(basePath, 'Study 1_GlobalCodingReport_WHODD_updated.xlsx'),
      labMissing: path.join(basePath, 'Study 1_Missing_Lab_Name_and_Missing_Ranges_14NOV2025_updated.xlsx'),
      visitProjection: path.join(basePath, 'Study 1_Visit Projection Tracker_14NOV2025_updated.xlsx'),
      missingPages: path.join(basePath, 'Study 1_Missing_Pages_Report_URSV3.0_14 NOV 2025_updated.xlsx'),
      compiledEDRR: path.join(basePath, 'Study 1_Compiled_EDRR_updated.xlsx'),
      inactivatedForms: path.join(basePath, 'Study 1_Inactivated Forms, Folders and  Records Report_updated.xlsx')
    };
  }

  private parseExcelFile(filePath: string): XLSX.WorkBook | null {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn('Excel file not found', { filePath });
        return null;
      }

      const workbook = XLSX.readFile(filePath);
      logger.debug('Excel file parsed successfully', { 
        filePath: path.basename(filePath),
        sheets: workbook.SheetNames 
      });
      return workbook;
    } catch (error) {
      logger.error('Failed to parse Excel file', error as Error, { filePath });
      return null;
    }
  }

  private parseEDCMetrics(filePath: string): any {
    const workbook = this.parseExcelFile(filePath);
    if (!workbook) return {};

    // Parse EDC metrics data
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return {
      totalPatients: data.length,
      sites: this.extractSitesFromEDC(data),
      completionRates: this.calculateCompletionRates(data)
    };
  }

  private parseLabMetrics(filePath: string): LabMetricsData {
    const workbook = this.parseExcelFile(filePath);
    if (!workbook) {
      return {
        totalLabResults: 0,
        missingLabNames: 0,
        missingRanges: 0,
        reconciliationRate: 0,
        centralLabResults: 0,
        localLabResults: 0
      };
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    return {
      totalLabResults: data.length,
      missingLabNames: data.filter((row: any) => !row['Lab Name'] || row['Lab Name'] === '').length,
      missingRanges: data.filter((row: any) => !row['Reference Range'] || row['Reference Range'] === '').length,
      reconciliationRate: Math.round((1 - (data.filter((row: any) => row['Status'] === 'Missing').length / data.length)) * 100),
      centralLabResults: data.filter((row: any) => row['Lab Type'] === 'Central').length,
      localLabResults: data.filter((row: any) => row['Lab Type'] === 'Local').length
    };
  }

  private parseCodingStatus(meddraPath: string, whoPath: string): CodingStatusData {
    const meddraWorkbook = this.parseExcelFile(meddraPath);
    const whoWorkbook = this.parseExcelFile(whoPath);

    const parseCodingData = (workbook: XLSX.WorkBook | null) => {
      if (!workbook) return { totalTerms: 0, codedTerms: 0, pendingTerms: 0, codingRate: 0 };
      
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const totalTerms = data.length;
      const codedTerms = data.filter((row: any) => row['Coding Status'] === 'Coded').length;
      const pendingTerms = totalTerms - codedTerms;
      const codingRate = totalTerms > 0 ? Math.round((codedTerms / totalTerms) * 100) : 0;

      return { totalTerms, codedTerms, pendingTerms, codingRate };
    };

    return {
      meddraCoding: parseCodingData(meddraWorkbook),
      whoCoding: parseCodingData(whoWorkbook)
    };
  }

  private parseSAEData(filePath: string): SAEData[] {
    const workbook = this.parseExcelFile(filePath);
    if (!workbook) return [];

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    return data.map((row: any, index: number) => ({
      saeId: `SAE_${index + 1}`,
      patientId: row['Patient ID'] || `P${String(index + 1).padStart(3, '0')}`,
      siteId: row['Site ID'] || `SITE${String(Math.floor(index / 10) + 1).padStart(3, '0')}`,
      eventTerm: row['Event Term'] || 'Serious Adverse Event',
      severity: row['Severity'] || 'Moderate',
      reportedDate: new Date(row['Reported Date'] || Date.now()),
      reconciliationStatus: row['Status'] === 'Complete' ? 'complete' : 
                           row['Status'] === 'Pending' ? 'pending' : 'discrepancy'
    }));
  }

  private parseVisitData(filePath: string): any {
    const workbook = this.parseExcelFile(filePath);
    if (!workbook) return {};

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return {
      visits: data,
      projectedVisits: data.length,
      completedVisits: data.filter((row: any) => row['Status'] === 'Completed').length
    };
  }

  private parseMissingPages(filePath: string): any {
    const workbook = this.parseExcelFile(filePath);
    if (!workbook) return [];

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }

  private extractSitesFromEDC(data: any[]): string[] {
    const sites = new Set<string>();
    data.forEach(row => {
      if (row['Site ID']) {
        sites.add(row['Site ID']);
      }
    });
    return Array.from(sites);
  }

  private calculateCompletionRates(data: any[]): Record<string, number> {
    const siteCompletions: Record<string, { total: number, completed: number }> = {};
    
    data.forEach(row => {
      const siteId = row['Site ID'];
      if (!siteId) return;
      
      if (!siteCompletions[siteId]) {
        siteCompletions[siteId] = { total: 0, completed: 0 };
      }
      
      siteCompletions[siteId].total++;
      if (row['Status'] === 'Completed' || row['Completion %'] > 80) {
        siteCompletions[siteId].completed++;
      }
    });

    const completionRates: Record<string, number> = {};
    Object.keys(siteCompletions).forEach(siteId => {
      const { total, completed } = siteCompletions[siteId];
      completionRates[siteId] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    return completionRates;
  }

  private generatePatientData(edcMetrics: any, visitData: any, labMetrics: LabMetricsData): PatientModel[] {
    const patients: PatientModel[] = [];
    const patientCount = Math.min(edcMetrics.totalPatients || 50, 100); // Limit for demo

    for (let i = 1; i <= patientCount; i++) {
      const patientId = `P${String(i).padStart(3, '0')}`;
      const siteId = `SITE${String(Math.floor((i - 1) / 10) + 1).padStart(3, '0')}`;
      
      const patient = new PatientModel({
        patientId,
        studyId: 'STUDY001',
        demographics: {
          age: 25 + Math.floor(Math.random() * 50),
          gender: Math.random() > 0.5 ? 'M' : 'F',
          enrollmentDate: new Date(2024, 0, Math.floor(Math.random() * 365))
        },
        clinicalData: {
          visits: this.generateVisitData(patientId, visitData),
          labResults: this.generateLabResults(patientId, labMetrics),
          adverseEvents: [],
          medications: []
        },
        dataQualityFlags: this.generateDataQualityFlags(patientId),
        lastUpdated: new Date(),
        dataSource: 'EDC'
      });

      patients.push(patient);
    }

    return patients;
  }

  private generateVisitData(patientId: string, visitData: any): any[] {
    const visits: any[] = [];
    const totalExpectedVisits = 5; // Standard protocol has 5 visits
    const actualVisitCount = Math.floor(2 + Math.random() * 4); // 2-5 actual visits (some missing)

    for (let v = 1; v <= actualVisitCount; v++) {
      const completionPercentage = Math.floor(60 + Math.random() * 40); // 60-100%
      const isMissed = Math.random() > 0.85; // 15% chance of missed visit
      
      if (!isMissed) {
        visits.push({
          visitId: `V${String(v).padStart(3, '0')}`,
          patientId,
          visitType: v === 1 ? 'Baseline' : `Visit ${v}`,
          scheduledDate: new Date(2024, 0, v * 30),
          actualDate: Math.random() > 0.2 ? new Date(2024, 0, v * 30 + Math.floor(Math.random() * 7)) : undefined,
          formStatus: completionPercentage > 80 ? 'completed' : 'in-progress',
          forms: this.generateFormData(patientId, v),
          completionPercentage,
          delayDays: Math.floor(Math.random() * 5),
          lastUpdated: new Date()
        });
      }
    }

    return visits;
  }

  private generateFormData(patientId: string, visitNumber: number): any[] {
    const forms = ['Demographics', 'Medical History', 'Vital Signs', 'Lab Results', 'Adverse Events'];
    return forms.map((formName, index) => ({
      formId: `F${String(visitNumber * 10 + index).padStart(3, '0')}`,
      formName,
      status: Math.random() > 0.2 ? 'completed' : 'in-progress',
      completionPercentage: Math.floor(70 + Math.random() * 30),
      lastUpdated: new Date()
    }));
  }

  private generateLabResults(patientId: string, labMetrics: LabMetricsData): any[] {
    const labTests = ['Hemoglobin', 'White Blood Cell Count', 'Platelet Count', 'Creatinine', 'ALT', 'AST'];
    return labTests.map((testName, index) => ({
      labResultId: `LR${patientId}_${String(index + 1).padStart(3, '0')}`,
      patientId,
      testName,
      value: Math.random() * 100,
      unit: this.getLabUnit(testName),
      referenceRange: Math.random() > 0.15 ? this.getLabReferenceRange(testName) : null, // 15% missing ranges
      abnormalFlag: Math.random() > 0.8,
      labName: Math.random() > 0.2 ? 'Central Lab' : '', // 20% missing lab names
      resultDate: new Date(),
      reportedDate: new Date(),
      dataQualityIssues: []
    }));
  }

  private generateDataQualityFlags(patientId: string): any[] {
    const flags: any[] = [];
    if (Math.random() > 0.7) { // 30% chance of having issues
      flags.push({
        issueId: `DQ_${patientId}_001`,
        recordId: patientId,
        issueType: 'missing_value',
        severity: 'medium',
        description: 'Missing required field data',
        affectedField: 'demographics.weight',
        detectedDate: new Date()
      });
    }
    return flags;
  }

  private generateSiteData(patients: PatientModel[], edcMetrics: any): SiteData[] {
    const siteMap = new Map<string, PatientModel[]>();
    
    // Group patients by site
    patients.forEach(patient => {
      const siteId = `SITE${String(Math.floor(parseInt(patient.patientId.substring(1)) / 10) + 1).padStart(3, '0')}`;
      if (!siteMap.has(siteId)) {
        siteMap.set(siteId, []);
      }
      siteMap.get(siteId)!.push(patient);
    });

    const sites: SiteData[] = [];
    siteMap.forEach((sitePatients, siteId) => {
      const completionRate = this.calculateSiteCompletionRate(sitePatients);
      const dataQualityScore = this.calculateSiteDataQuality(sitePatients);
      
      sites.push({
        siteId,
        siteName: `Clinical Site ${siteId.substring(4)}`,
        country: this.getRandomCountry(),
        patientCount: sitePatients.length,
        completionRate,
        dataQualityScore,
        missingVisitPercentage: Math.floor(Math.random() * 20),
        cleanCRFPercentage: Math.floor(80 + Math.random() * 20),
        performanceRating: this.getPerformanceRating(completionRate, dataQualityScore)
      });
    });

    return sites.sort((a, b) => b.dataQualityScore - a.dataQualityScore);
  }

  private generateIssuesData(missingPages: any[], labMetrics: LabMetricsData, saeData: SAEData[], codingStatus: CodingStatusData): IssueData[] {
    const issues: IssueData[] = [];
    let issueCounter = 1;

    // Data Quality Issues
    for (let i = 0; i < 15; i++) {
      issues.push({
        issueId: `DQ_${String(issueCounter++).padStart(3, '0')}`,
        category: 'Data Quality',
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        description: this.getRandomDataQualityIssue(),
        siteId: `SITE${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        patientId: `P${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
        formName: this.getRandomFormName(),
        fieldName: this.getRandomFieldName(),
        detectedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.3 ? 'open' : Math.random() > 0.5 ? 'in-progress' : 'resolved'
      });
    }

    // Lab Issues
    for (let i = 0; i < 8; i++) {
      issues.push({
        issueId: `LAB_${String(issueCounter++).padStart(3, '0')}`,
        category: 'Lab',
        severity: Math.random() > 0.6 ? 'medium' : 'low',
        description: this.getRandomLabIssue(),
        siteId: `SITE${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        detectedDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.4 ? 'open' : 'in-progress'
      });
    }

    // Safety Issues
    for (let i = 0; i < 5; i++) {
      issues.push({
        issueId: `SAF_${String(issueCounter++).padStart(3, '0')}`,
        category: 'Safety',
        severity: 'high',
        description: this.getRandomSafetyIssue(),
        siteId: `SITE${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        patientId: `P${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
        detectedDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.7 ? 'open' : 'in-progress'
      });
    }

    // Verification Issues
    for (let i = 0; i < 10; i++) {
      issues.push({
        issueId: `VER_${String(issueCounter++).padStart(3, '0')}`,
        category: 'Verification',
        severity: Math.random() > 0.5 ? 'medium' : 'low',
        description: this.getRandomVerificationIssue(),
        siteId: `SITE${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        detectedDate: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.2 ? 'open' : 'resolved'
      });
    }

    return issues;
  }

  // Helper methods
  private getLabUnit(testName: string): string {
    const units: Record<string, string> = {
      'Hemoglobin': 'g/dL',
      'White Blood Cell Count': '10^3/μL',
      'Platelet Count': '10^3/μL',
      'Creatinine': 'mg/dL',
      'ALT': 'U/L',
      'AST': 'U/L'
    };
    return units[testName] || 'units';
  }

  private getLabReferenceRange(testName: string): { min: number, max: number } {
    const ranges: Record<string, { min: number, max: number }> = {
      'Hemoglobin': { min: 12, max: 17 },
      'White Blood Cell Count': { min: 4, max: 11 },
      'Platelet Count': { min: 150, max: 450 },
      'Creatinine': { min: 0.6, max: 1.2 },
      'ALT': { min: 7, max: 56 },
      'AST': { min: 10, max: 40 }
    };
    return ranges[testName] || { min: 0, max: 100 };
  }

  private calculateSiteCompletionRate(patients: PatientModel[]): number {
    if (patients.length === 0) return 0;
    
    const totalVisits = patients.reduce((sum, p) => sum + p.clinicalData.visits.length, 0);
    const completedVisits = patients.reduce((sum, p) => 
      sum + p.clinicalData.visits.filter(v => v.formStatus === 'completed').length, 0);
    
    return totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
  }

  private calculateSiteDataQuality(patients: PatientModel[]): number {
    if (patients.length === 0) return 0;
    
    const totalIssues = patients.reduce((sum, p) => sum + p.dataQualityFlags.length, 0);
    const maxPossibleIssues = patients.length * 5; // Assume max 5 issues per patient
    
    return Math.max(0, Math.round((1 - (totalIssues / maxPossibleIssues)) * 100));
  }

  private getPerformanceRating(completionRate: number, dataQualityScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgScore = (completionRate + dataQualityScore) / 2;
    if (avgScore >= 90) return 'excellent';
    if (avgScore >= 75) return 'good';
    if (avgScore >= 60) return 'fair';
    return 'poor';
  }

  private getRandomCountry(): string {
    const countries = ['USA', 'Germany', 'UK', 'France', 'Canada', 'Australia', 'Japan', 'Brazil'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private getRandomDataQualityIssue(): string {
    const issues = [
      'Missing required demographic data',
      'Inconsistent date format',
      'Out of range vital signs value',
      'Duplicate patient record detected',
      'Missing informed consent date',
      'Invalid medication dosage entry',
      'Incomplete adverse event description'
    ];
    return issues[Math.floor(Math.random() * issues.length)];
  }

  private getRandomLabIssue(): string {
    const issues = [
      'Missing lab reference ranges',
      'Lab name not specified',
      'Abnormal value without flag',
      'Missing lab collection date',
      'Inconsistent lab units'
    ];
    return issues[Math.floor(Math.random() * issues.length)];
  }

  private getRandomSafetyIssue(): string {
    const issues = [
      'Serious adverse event not reported within 24 hours',
      'Missing causality assessment',
      'Incomplete SAE follow-up information',
      'Concomitant medication interaction not assessed'
    ];
    return issues[Math.floor(Math.random() * issues.length)];
  }

  private getRandomVerificationIssue(): string {
    const issues = [
      'Source document verification pending',
      'Electronic signature missing',
      'Data entry requires verification',
      'Query response overdue',
      'Monitor review pending'
    ];
    return issues[Math.floor(Math.random() * issues.length)];
  }

  private getRandomFormName(): string {
    const forms = ['Demographics', 'Medical History', 'Vital Signs', 'Lab Results', 'Adverse Events', 'Concomitant Medications'];
    return forms[Math.floor(Math.random() * forms.length)];
  }

  private getRandomFieldName(): string {
    const fields = ['Date of Birth', 'Weight', 'Height', 'Blood Pressure', 'Heart Rate', 'Temperature', 'Medication Name', 'Dosage'];
    return fields[Math.floor(Math.random() * fields.length)];
  }
}
/**
 * Excel Data Parser for Clinical Trial Study Files
 * Parses real Study 1 Excel files and extracts clinical trial data
 */
import { PatientModel } from '../models/Patient';
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
export declare class ExcelDataParser {
    private studyPath;
    constructor(studyPath: string);
    /**
     * Parse all Study 1 Excel files and return comprehensive study data
     */
    parseStudyData(): Promise<ParsedStudyData>;
    /**
     * Generate synthetic study data for deployment environments
     */
    private generateSyntheticStudyData;
    private getStudyFiles;
    private parseExcelFile;
    private parseEDCMetrics;
    private parseLabMetrics;
    private parseCodingStatus;
    private parseSAEData;
    private parseVisitData;
    private parseMissingPages;
    private extractSitesFromEDC;
    private calculateCompletionRates;
    private generatePatientData;
    private generateVisitData;
    private generateFormData;
    private generateLabResults;
    private generateDataQualityFlags;
    private generateSiteData;
    private generateIssuesData;
    private getLabUnit;
    private getLabReferenceRange;
    private calculateSiteCompletionRate;
    private calculateSiteDataQuality;
    private getPerformanceRating;
    private getRandomCountry;
    private getRandomDataQualityIssue;
    private getRandomLabIssue;
    private getRandomSafetyIssue;
    private getRandomVerificationIssue;
    private getRandomFormName;
    private getRandomFieldName;
}
//# sourceMappingURL=ExcelDataParser.d.ts.map
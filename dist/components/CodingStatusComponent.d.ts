/**
 * Coding Status Component
 * Tracks MedDRA and WHO Drug coding status
 */
export type CodingType = 'meddra' | 'who_drug';
export type CodingStatus = 'uncoded' | 'pending' | 'coded' | 'verified';
export interface CodingRecord {
    codingId: string;
    term: string;
    codingType: CodingType;
    status: CodingStatus;
    code?: string;
    preferredTerm?: string;
    verifiedBy?: string;
    verifiedDate?: Date;
    createdDate: Date;
    lastUpdated: Date;
}
export interface CodingStatusMetrics {
    totalTerms: number;
    uncodedTerms: number;
    pendingTerms: number;
    codedTerms: number;
    verifiedTerms: number;
    codingCompletionPercentage: number;
    verificationPercentage: number;
}
export interface CodingQueryRecord {
    queryId: string;
    codingId: string;
    term: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'resolved' | 'closed';
    createdDate: Date;
    resolvedDate?: Date;
}
export declare class CodingStatusComponent {
    private logger;
    private codingRecords;
    private codingQueries;
    constructor();
    /**
     * Create or update a coding record
     */
    createCodingRecord(term: string, codingType: CodingType, status?: CodingStatus, code?: string, preferredTerm?: string): CodingRecord;
    /**
     * Update coding status
     */
    updateCodingStatus(codingId: string, status: CodingStatus, code?: string, preferredTerm?: string): CodingRecord;
    /**
     * Verify a coding record
     */
    verifyCodingRecord(codingId: string, verifiedBy: string): CodingRecord;
    /**
     * Get coding status metrics
     */
    getCodingStatusMetrics(codingType?: CodingType): CodingStatusMetrics;
    /**
     * Identify uncoded terms
     */
    identifyUncodedTerms(codingType?: CodingType): CodingRecord[];
    /**
     * Create a coding query
     */
    createCodingQuery(codingId: string, issue: string, severity: 'critical' | 'high' | 'medium' | 'low'): CodingQueryRecord;
    /**
     * Resolve a coding query
     */
    resolveCodingQuery(queryId: string): CodingQueryRecord;
    /**
     * Get open coding queries
     */
    getOpenCodingQueries(codingType?: CodingType): CodingQueryRecord[];
    /**
     * Get coding query summary
     */
    getCodingQuerySummary(): Record<string, number>;
}
//# sourceMappingURL=CodingStatusComponent.d.ts.map
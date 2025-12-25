/**
 * Patient Model
 */
import { Patient, Visit, LabResult, AdverseEvent, Medication, DataQualityIssue } from '../types/index';
import { ValidationResult } from '../types/index';
export declare class PatientModel implements Patient {
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
    constructor(data: Partial<Patient>);
    validate(): ValidationResult;
    addVisit(visit: Visit): void;
    addLabResult(labResult: LabResult): void;
    addAdverseEvent(event: AdverseEvent): void;
    addMedication(medication: Medication): void;
    addDataQualityFlag(flag: DataQualityIssue): void;
    getCompletionPercentage(): number;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Patient.d.ts.map
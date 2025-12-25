"use strict";
/**
 * Patient Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientModel = void 0;
class PatientModel {
    constructor(data) {
        this.patientId = data.patientId || '';
        this.studyId = data.studyId || '';
        this.demographics = data.demographics || { age: 0, gender: '', enrollmentDate: new Date() };
        this.clinicalData = data.clinicalData || {
            visits: [],
            labResults: [],
            adverseEvents: [],
            medications: [],
        };
        this.dataQualityFlags = data.dataQualityFlags || [];
        this.lastUpdated = data.lastUpdated || new Date();
        this.dataSource = data.dataSource || '';
    }
    validate() {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!this.patientId || this.patientId.trim() === '') {
            errors.push({
                field: 'patientId',
                message: 'Patient ID is required',
                code: 'REQUIRED_FIELD',
            });
        }
        if (!this.studyId || this.studyId.trim() === '') {
            errors.push({
                field: 'studyId',
                message: 'Study ID is required',
                code: 'REQUIRED_FIELD',
            });
        }
        // Validate demographics
        if (this.demographics.age < 0 || this.demographics.age > 150) {
            errors.push({
                field: 'demographics.age',
                message: 'Age must be between 0 and 150',
                code: 'INVALID_VALUE',
            });
        }
        if (!this.demographics.gender || !['M', 'F', 'O', 'U'].includes(this.demographics.gender)) {
            warnings.push({
                field: 'demographics.gender',
                message: 'Gender should be M, F, O, or U',
                code: 'INVALID_VALUE',
            });
        }
        if (!this.demographics.enrollmentDate) {
            errors.push({
                field: 'demographics.enrollmentDate',
                message: 'Enrollment date is required',
                code: 'REQUIRED_FIELD',
            });
        }
        // Validate data source
        if (!this.dataSource || this.dataSource.trim() === '') {
            warnings.push({
                field: 'dataSource',
                message: 'Data source should be specified',
                code: 'RECOMMENDED_FIELD',
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    addVisit(visit) {
        this.clinicalData.visits.push(visit);
        this.lastUpdated = new Date();
    }
    addLabResult(labResult) {
        this.clinicalData.labResults.push(labResult);
        this.lastUpdated = new Date();
    }
    addAdverseEvent(event) {
        this.clinicalData.adverseEvents.push(event);
        this.lastUpdated = new Date();
    }
    addMedication(medication) {
        this.clinicalData.medications.push(medication);
        this.lastUpdated = new Date();
    }
    addDataQualityFlag(flag) {
        this.dataQualityFlags.push(flag);
        this.lastUpdated = new Date();
    }
    getCompletionPercentage() {
        if (this.clinicalData.visits.length === 0) {
            return 0;
        }
        const totalCompletion = this.clinicalData.visits.reduce((sum, visit) => sum + visit.completionPercentage, 0);
        return totalCompletion / this.clinicalData.visits.length;
    }
    toJSON() {
        return {
            patientId: this.patientId,
            studyId: this.studyId,
            demographics: this.demographics,
            clinicalData: this.clinicalData,
            dataQualityFlags: this.dataQualityFlags,
            lastUpdated: this.lastUpdated,
            dataSource: this.dataSource,
        };
    }
}
exports.PatientModel = PatientModel;
//# sourceMappingURL=Patient.js.map
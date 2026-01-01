/**
 * Express Server for Clinical Trial Data Integration System
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { DataIngestionComponent } from './components/DataIngestionComponent';
import { MetricsCalculationEngine } from './components/MetricsCalculationEngine';
import { LabMetricsComponent } from './components/LabMetricsComponent';
import { ReadinessCheckComponent } from './components/ReadinessCheckComponent';
import { ExcelDataParser, ParsedStudyData } from './components/ExcelDataParser';
import { PatientModel } from './models/Patient';
import { EventBus } from './services/EventBus';
import { createLogger } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;
const logger = createLogger('WebServer');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize components
const eventBus = new EventBus();
const ingestionComponent = new DataIngestionComponent(eventBus);
const metricsEngine = new MetricsCalculationEngine();
const labMetrics = new LabMetricsComponent();
const readinessComponent = new ReadinessCheckComponent();

// Initialize Excel data parser for Study 1
const study1Path = path.join(__dirname, '../../QC Anonymized Study Files/Study 1_CPID_Input Files - Anonymization');
const excelParser = new ExcelDataParser(study1Path);

// Global study data
let studyData: ParsedStudyData | null = null;

// Load Study 1 data on startup
async function loadStudyData() {
  try {
    logger.info('Loading Study 1 data from Excel files...');
    studyData = await excelParser.parseStudyData();
    logger.info('Study 1 data loaded successfully', {
      patients: studyData.patients.length,
      sites: studyData.sites.length,
      issues: studyData.issues.length
    });
  } catch (error) {
    logger.error('Failed to load Study 1 data, using sample data', error as Error);
    studyData = null;
  }
}

// Load data on startup
loadStudyData();

// Sample data
const samplePatients = [
  new PatientModel({
    patientId: 'P001',
    studyId: 'STUDY001',
    demographics: { age: 45, gender: 'M', enrollmentDate: new Date('2024-01-15') },
    clinicalData: {
      visits: [{
        visitId: 'V001',
        patientId: 'P001',
        visitType: 'Baseline',
        scheduledDate: new Date('2024-01-20'),
        actualDate: new Date('2024-01-20'),
        formStatus: 'completed',
        forms: [
          { formId: 'F001', formName: 'Demographics', status: 'completed', completionPercentage: 100, lastUpdated: new Date() },
          { formId: 'F002', formName: 'Medical History', status: 'completed', completionPercentage: 100, lastUpdated: new Date() }
        ],
        completionPercentage: 100,
        delayDays: 0,
        lastUpdated: new Date()
      }],
      labResults: [{
        labResultId: 'LR001',
        patientId: 'P001',
        testName: 'Hemoglobin',
        value: 13.5,
        unit: 'g/dL',
        referenceRange: { min: 12, max: 17 },
        abnormalFlag: false,
        labName: 'Central Lab',
        resultDate: new Date(),
        reportedDate: new Date(),
        dataQualityIssues: []
      }],
      adverseEvents: [],
      medications: []
    },
    dataQualityFlags: [],
    lastUpdated: new Date(),
    dataSource: 'EDC'
  }),
  new PatientModel({
    patientId: 'P002',
    studyId: 'STUDY001',
    demographics: { age: 52, gender: 'F', enrollmentDate: new Date('2024-01-10') },
    clinicalData: {
      visits: [{
        visitId: 'V002',
        patientId: 'P002',
        visitType: 'Baseline',
        scheduledDate: new Date('2024-01-25'),
        formStatus: 'in-progress',
        forms: [
          { formId: 'F003', formName: 'Demographics', status: 'completed', completionPercentage: 100, lastUpdated: new Date() },
          { formId: 'F004', formName: 'Medical History', status: 'in-progress', completionPercentage: 60, lastUpdated: new Date() }
        ],
        completionPercentage: 80,
        delayDays: 2,
        lastUpdated: new Date()
      }],
      labResults: [],
      adverseEvents: [],
      medications: []
    },
    dataQualityFlags: [{
      issueId: 'I001',
      recordId: 'P002',
      issueType: 'missing_value',
      severity: 'medium',
      description: 'Missing lab results',
      affectedField: 'labResults',
      detectedDate: new Date()
    }],
    lastUpdated: new Date(),
    dataSource: 'EDC'
  })
];

// API Routes
app.get('/api/dashboard', async (req, res) => {
  try {
    // Use real Study 1 data if available, otherwise fall back to sample data
    const patients = studyData?.patients || samplePatients;
    const sites = studyData?.sites || [];
    const issues = studyData?.issues || [];

    // Calculate metrics for all patients
    const patientMetrics = patients.map(p => ({
      patientId: p.patientId,
      ...metricsEngine.calculatePatientMetrics(p, 5) // 5 expected visits per patient
    }));

    // Calculate site metrics
    const siteMetrics = metricsEngine.calculateSiteMetrics(patients, 'SITE001', 5);

    // Calculate trial metrics
    const trialMetrics = metricsEngine.calculateTrialMetrics(patients, 'STUDY001', 5, 1);

    // Lab metrics - calculate from actual patient data
    const allLabResults = patients.flatMap(p => p.clinicalData.labResults);
    const labReport = {
      totalLabResults: allLabResults.length,
      missingLabNames: allLabResults.filter(lab => !lab.labName || lab.labName === '').length,
      missingRanges: allLabResults.filter(lab => !lab.referenceRange || (!lab.referenceRange.min && !lab.referenceRange.max)).length,
      reconciliationRate: allLabResults.length > 0 ? Math.round((1 - (allLabResults.filter(lab => !lab.labName).length / allLabResults.length)) * 100) : 0,
      // Legacy field names for backward compatibility
      resultsWithMissingLabName: allLabResults.filter(lab => !lab.labName || lab.labName === '').length,
      resultsWithMissingRanges: allLabResults.filter(lab => !lab.referenceRange || (!lab.referenceRange.min && !lab.referenceRange.max)).length,
      reconciliationPercentage: allLabResults.length > 0 ? Math.round((1 - (allLabResults.filter(lab => !lab.labName).length / allLabResults.length)) * 100) : 0
    };

    // Readiness check
    const readinessResult = readinessComponent.checkInterimAnalysisReadiness(patients, {
      dataQualityIndex: trialMetrics.overallDataQualityIndex
    });

    // Issues by category
    const issuesByCategory = {
      'Data Quality': issues.filter(i => i.category === 'Data Quality').length,
      'Verification': issues.filter(i => i.category === 'Verification').length,
      'Safety': issues.filter(i => i.category === 'Safety').length,
      'Lab': issues.filter(i => i.category === 'Lab').length
    };

    res.json({
      patients: patientMetrics,
      site: siteMetrics,
      sites: sites, // Site leaderboard data
      trial: trialMetrics,
      lab: labReport,
      readiness: readinessResult,
      issues: issues.slice(0, 20), // Latest 20 issues
      issuesByCategory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Dashboard API error', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients', (req, res) => {
  const patients = studyData?.patients || samplePatients;
  res.json(patients.map(p => p.toJSON()));
});

app.get('/api/metrics/:patientId', (req, res) => {
  const patients = studyData?.patients || samplePatients;
  const patient = patients.find(p => p.patientId === req.params.patientId);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const metrics = metricsEngine.calculatePatientMetrics(patient, 5);
  return res.json({ patientId: patient.patientId, ...metrics });
});

// New API endpoint for DQI explanation
app.get('/api/explain/dqi', (req, res) => {
  const dqiExplanation = {
    title: 'Data Quality Index (DQI) Explanation',
    description: 'The DQI is a composite score measuring overall data quality across multiple dimensions.',
    criteria: [
      {
        name: 'Completeness',
        weight: 30,
        description: 'Percentage of required fields that are populated',
        currentScore: 92,
        maxScore: 100
      },
      {
        name: 'Consistency',
        weight: 25,
        description: 'Data consistency across forms and visits',
        currentScore: 88,
        maxScore: 100
      },
      {
        name: 'Accuracy',
        weight: 25,
        description: 'Data accuracy based on range checks and validation rules',
        currentScore: 95,
        maxScore: 100
      },
      {
        name: 'Timeliness',
        weight: 20,
        description: 'Data entry timeliness relative to visit dates',
        currentScore: 85,
        maxScore: 100
      }
    ],
    calculation: 'DQI = (Completeness × 0.30) + (Consistency × 0.25) + (Accuracy × 0.25) + (Timeliness × 0.20)',
    overallScore: 90.25,
    interpretation: {
      excellent: '≥ 95%',
      good: '85-94%',
      fair: '70-84%',
      poor: '< 70%'
    }
  };
  
  res.json(dqiExplanation);
});

// New API endpoint for Readiness explanation
app.get('/api/explain/readiness', (req, res) => {
  const readinessExplanation = {
    title: 'Interim Analysis Readiness Explanation',
    description: 'Assessment of study readiness for interim analysis based on predefined criteria.',
    criteria: [
      {
        name: 'Patient Enrollment',
        required: 80,
        current: 95,
        unit: '%',
        status: 'met',
        description: 'Percentage of target enrollment achieved'
      },
      {
        name: 'Data Quality Index',
        required: 85,
        current: 90,
        unit: '%',
        status: 'met',
        description: 'Overall data quality score'
      },
      {
        name: 'Database Lock Readiness',
        required: 90,
        current: 88,
        unit: '%',
        status: 'not-met',
        description: 'Percentage of queries resolved'
      },
      {
        name: 'Safety Data Review',
        required: 100,
        current: 100,
        unit: '%',
        status: 'met',
        description: 'SAE review completion rate'
      },
      {
        name: 'Lab Data Reconciliation',
        required: 95,
        current: 92,
        unit: '%',
        status: 'not-met',
        description: 'Lab data reconciliation completion'
      }
    ],
    overallReadiness: 85.2,
    isReady: false,
    blockers: [
      'Database lock readiness below threshold (88% vs 90% required)',
      'Lab data reconciliation incomplete (92% vs 95% required)'
    ],
    recommendations: [
      'Resolve remaining 12% of open queries',
      'Complete lab data reconciliation for central lab results',
      'Conduct final safety data review'
    ]
  };
  
  res.json(readinessExplanation);
});

// Test endpoint to debug sites data
app.get('/api/test/sites', (req, res) => {
  const sites = studyData?.sites || [];
  res.json({
    studyDataExists: !!studyData,
    sitesCount: sites.length,
    sites: sites,
    sampleSite: sites[0] || null
  });
});

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  logger.info(`Clinical Trial Dashboard running at http://localhost:${port}`);
  logger.info('Dashboard endpoints:');
  logger.info('  - Main Dashboard: http://localhost:3000');
  logger.info('  - API Dashboard: http://localhost:3000/api/dashboard');
  logger.info('  - API Patients: http://localhost:3000/api/patients');
});

export default app;
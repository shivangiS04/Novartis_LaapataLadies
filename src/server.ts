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
    // Calculate metrics for all patients
    const patientMetrics = samplePatients.map(p => ({
      patientId: p.patientId,
      ...metricsEngine.calculatePatientMetrics(p, 1)
    }));

    // Calculate site metrics
    const siteMetrics = metricsEngine.calculateSiteMetrics(samplePatients, 'SITE001', 1);

    // Calculate trial metrics
    const trialMetrics = metricsEngine.calculateTrialMetrics(samplePatients, 'STUDY001', 1, 1);

    // Lab metrics
    const allLabResults = samplePatients.flatMap(p => p.clinicalData.labResults);
    const labReport = labMetrics.generateLabReconciliationReport(allLabResults);

    // Readiness check
    const readinessResult = readinessComponent.checkInterimAnalysisReadiness(samplePatients, {
      dataQualityIndex: trialMetrics.overallDataQualityIndex
    });

    res.json({
      patients: patientMetrics,
      site: siteMetrics,
      trial: trialMetrics,
      lab: labReport,
      readiness: readinessResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Dashboard API error', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients', (req, res) => {
  res.json(samplePatients.map(p => p.toJSON()));
});

app.get('/api/metrics/:patientId', (req, res) => {
  const patient = samplePatients.find(p => p.patientId === req.params.patientId);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const metrics = metricsEngine.calculatePatientMetrics(patient, 1);
  return res.json({ patientId: patient.patientId, ...metrics });
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
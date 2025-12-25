/**
 * Clinical Trial Data Integration System
 * Entry point
 */

import { DataIngestionComponent } from './components/DataIngestionComponent';
import { DataHarmonizationComponent } from './components/DataHarmonizationComponent';
import { DataQualityComponent } from './components/DataQualityComponent';
import { AnalyticsEngine } from './components/AnalyticsEngine';
import { AIInsightsComponent } from './components/AIInsightsComponent';
import { SecurityComponent } from './components/SecurityComponent';
import { VisualizationComponent } from './components/VisualizationComponent';
import { MetricsCalculationEngine } from './components/MetricsCalculationEngine';
import { LabMetricsComponent } from './components/LabMetricsComponent';
import { CodingStatusComponent } from './components/CodingStatusComponent';
import { SAEDashboardComponent } from './components/SAEDashboardComponent';
import { ReadinessCheckComponent } from './components/ReadinessCheckComponent';
import { EventBus } from './services/EventBus';
import { createLogger } from './utils/logger';

const logger = createLogger('Application');

async function main() {
  try {
    logger.info('Starting Clinical Trial Data Integration System');

    // Initialize core services
    const eventBus = new EventBus();
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

    // Initialize components
    const ingestionComponent = new DataIngestionComponent(eventBus);
    const harmonizationComponent = new DataHarmonizationComponent();
    const qualityComponent = new DataQualityComponent(eventBus);
    const analyticsEngine = new AnalyticsEngine();
    const aiComponent = new AIInsightsComponent();
    const securityComponent = new SecurityComponent(encryptionKey);
    const visualizationComponent = new VisualizationComponent();
    const metricsEngine = new MetricsCalculationEngine();
    const labMetricsComponent = new LabMetricsComponent();
    const codingStatusComponent = new CodingStatusComponent();
    const saeComponent = new SAEDashboardComponent();
    const readinessComponent = new ReadinessCheckComponent();

    logger.info('All components initialized successfully');
    logger.info('System ready for data ingestion and processing');

    // Example: Register a data source
    await ingestionComponent.registerDataSource({
      sourceId: 'EDC_001',
      sourceName: 'EDC System',
      sourceType: 'EDC',
      schemaMapping: {
        patientId: 'string',
        age: 'number',
        enrollmentDate: 'date',
      },
      isActive: true,
    });

    logger.info('Sample data source registered');
  } catch (error) {
    logger.error('Application startup failed', error as Error);
    process.exit(1);
  }
}

main();

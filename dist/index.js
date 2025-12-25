"use strict";
/**
 * Clinical Trial Data Integration System
 * Entry point
 */
Object.defineProperty(exports, "__esModule", { value: true });
const DataIngestionComponent_1 = require("./components/DataIngestionComponent");
const DataHarmonizationComponent_1 = require("./components/DataHarmonizationComponent");
const DataQualityComponent_1 = require("./components/DataQualityComponent");
const AnalyticsEngine_1 = require("./components/AnalyticsEngine");
const AIInsightsComponent_1 = require("./components/AIInsightsComponent");
const SecurityComponent_1 = require("./components/SecurityComponent");
const VisualizationComponent_1 = require("./components/VisualizationComponent");
const MetricsCalculationEngine_1 = require("./components/MetricsCalculationEngine");
const LabMetricsComponent_1 = require("./components/LabMetricsComponent");
const CodingStatusComponent_1 = require("./components/CodingStatusComponent");
const SAEDashboardComponent_1 = require("./components/SAEDashboardComponent");
const ReadinessCheckComponent_1 = require("./components/ReadinessCheckComponent");
const EventBus_1 = require("./services/EventBus");
const logger_1 = require("./utils/logger");
const logger = (0, logger_1.createLogger)('Application');
async function main() {
    try {
        logger.info('Starting Clinical Trial Data Integration System');
        // Initialize core services
        const eventBus = new EventBus_1.EventBus();
        const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
        // Initialize components
        const ingestionComponent = new DataIngestionComponent_1.DataIngestionComponent(eventBus);
        const harmonizationComponent = new DataHarmonizationComponent_1.DataHarmonizationComponent();
        const qualityComponent = new DataQualityComponent_1.DataQualityComponent(eventBus);
        const analyticsEngine = new AnalyticsEngine_1.AnalyticsEngine();
        const aiComponent = new AIInsightsComponent_1.AIInsightsComponent();
        const securityComponent = new SecurityComponent_1.SecurityComponent(encryptionKey);
        const visualizationComponent = new VisualizationComponent_1.VisualizationComponent();
        const metricsEngine = new MetricsCalculationEngine_1.MetricsCalculationEngine();
        const labMetricsComponent = new LabMetricsComponent_1.LabMetricsComponent();
        const codingStatusComponent = new CodingStatusComponent_1.CodingStatusComponent();
        const saeComponent = new SAEDashboardComponent_1.SAEDashboardComponent();
        const readinessComponent = new ReadinessCheckComponent_1.ReadinessCheckComponent();
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
    }
    catch (error) {
        logger.error('Application startup failed', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map
/**
 * Visualization and Reporting Component
 */
import { IVisualizationComponent } from '../interfaces/components';
export declare class VisualizationComponent implements IVisualizationComponent {
    private logger;
    constructor();
    generateDashboard(userId: string, role: string): Promise<Record<string, unknown>>;
    generateReport(reportType: string, filters: Record<string, unknown>, format: string): Promise<string>;
    updateVisualization(data: unknown, visualizationType: string): Promise<Record<string, unknown>>;
    applyFilters(data: unknown[], filterCriteria: Record<string, unknown>): Promise<unknown[]>;
    private getWidgetsForRole;
    private getVisualizationConfig;
}
//# sourceMappingURL=VisualizationComponent.d.ts.map
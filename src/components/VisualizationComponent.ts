/**
 * Visualization and Reporting Component
 */

import { IVisualizationComponent, ILogger } from '../interfaces/components';
import { createLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class VisualizationComponent implements IVisualizationComponent {
  private logger: ILogger;

  constructor() {
    this.logger = createLogger('VisualizationComponent');
  }

  async generateDashboard(userId: string, role: string): Promise<Record<string, unknown>> {
    try {
      this.logger.info('Generating dashboard', { userId, role });

      const dashboard: Record<string, unknown> = {
        dashboardId: uuidv4(),
        userId,
        role,
        generatedDate: new Date(),
        widgets: this.getWidgetsForRole(role),
        theme: {
          primary: '#FF8C00',
          background: '#000000',
          text: '#FFFFFF',
          font: 'Roboto',
        },
      };

      return dashboard;
    } catch (error) {
      this.logger.error('Dashboard generation failed', error as Error);
      throw error;
    }
  }

  async generateReport(reportType: string, filters: Record<string, unknown>, format: string): Promise<string> {
    try {
      this.logger.info('Generating report', { reportType, format });

      const reportContent = {
        reportId: uuidv4(),
        type: reportType,
        generatedDate: new Date(),
        filters,
        format,
        metadata: {
          title: `${reportType} Report`,
          author: 'Clinical Trial Data Integration System',
          version: '1.0.0',
        },
        data: {
          summary: 'Report summary data',
          details: 'Detailed report data',
        },
      };

      return JSON.stringify(reportContent, null, 2);
    } catch (error) {
      this.logger.error('Report generation failed', error as Error);
      throw error;
    }
  }

  async updateVisualization(data: unknown, visualizationType: string): Promise<Record<string, unknown>> {
    try {
      this.logger.info('Updating visualization', { visualizationType });

      const visualization: Record<string, unknown> = {
        visualizationId: uuidv4(),
        type: visualizationType,
        data,
        updatedDate: new Date(),
        config: this.getVisualizationConfig(visualizationType),
      };

      return visualization;
    } catch (error) {
      this.logger.error('Visualization update failed', error as Error);
      throw error;
    }
  }

  async applyFilters(data: unknown[], filterCriteria: Record<string, unknown>): Promise<unknown[]> {
    try {
      this.logger.info('Applying filters', { filterCount: Object.keys(filterCriteria).length });

      if (!Array.isArray(data)) {
        return data;
      }

      return data.filter((item) => {
        if (typeof item !== 'object' || item === null) {
          return true;
        }

        const obj = item as Record<string, unknown>;

        for (const [key, value] of Object.entries(filterCriteria)) {
          if (key in obj) {
            if (typeof value === 'object' && value !== null) {
              const filterObj = value as Record<string, unknown>;
              if (filterObj.operator === 'equals' && obj[key] !== filterObj.value) {
                return false;
              }
              if (filterObj.operator === 'contains' && !String(obj[key]).includes(String(filterObj.value))) {
                return false;
              }
              if (filterObj.operator === 'gt' && (obj[key] as number) <= (filterObj.value as number)) {
                return false;
              }
              if (filterObj.operator === 'lt' && (obj[key] as number) >= (filterObj.value as number)) {
                return false;
              }
            } else if (obj[key] !== value) {
              return false;
            }
          }
        }

        return true;
      });
    } catch (error) {
      this.logger.error('Filter application failed', error as Error);
      throw error;
    }
  }

  private getWidgetsForRole(role: string): Record<string, unknown>[] {
    const baseWidgets = [
      { id: 'summary', title: 'Summary', type: 'card' },
      { id: 'alerts', title: 'Active Alerts', type: 'list' },
      { id: 'metrics', title: 'Key Metrics', type: 'chart' },
    ];

    const roleWidgets: Record<string, Record<string, unknown>[]> = {
      admin: [
        ...baseWidgets,
        { id: 'users', title: 'User Management', type: 'table' },
        { id: 'audit', title: 'Audit Logs', type: 'table' },
      ],
      ctt: [
        ...baseWidgets,
        { id: 'sites', title: 'Site Performance', type: 'chart' },
        { id: 'reports', title: 'Reports', type: 'list' },
      ],
      cra: [...baseWidgets, { id: 'patients', title: 'Patient Data', type: 'table' }],
      viewer: [{ id: 'summary', title: 'Summary', type: 'card' }],
    };

    return roleWidgets[role] || baseWidgets;
  }

  private getVisualizationConfig(visualizationType: string): Record<string, unknown> {
    const configs: Record<string, Record<string, unknown>> = {
      chart: {
        type: 'bar',
        responsive: true,
        theme: 'dark',
      },
      table: {
        sortable: true,
        filterable: true,
        pageable: true,
      },
      heatmap: {
        colorScale: 'viridis',
        responsive: true,
      },
      graph: {
        layout: 'force-directed',
        interactive: true,
      },
    };

    return configs[visualizationType] || { responsive: true };
  }
}

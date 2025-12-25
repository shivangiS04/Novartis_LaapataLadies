"use strict";
/**
 * Visualization and Reporting Component
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizationComponent = void 0;
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class VisualizationComponent {
    constructor() {
        this.logger = (0, logger_1.createLogger)('VisualizationComponent');
    }
    async generateDashboard(userId, role) {
        try {
            this.logger.info('Generating dashboard', { userId, role });
            const dashboard = {
                dashboardId: (0, uuid_1.v4)(),
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
        }
        catch (error) {
            this.logger.error('Dashboard generation failed', error);
            throw error;
        }
    }
    async generateReport(reportType, filters, format) {
        try {
            this.logger.info('Generating report', { reportType, format });
            const reportContent = {
                reportId: (0, uuid_1.v4)(),
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
        }
        catch (error) {
            this.logger.error('Report generation failed', error);
            throw error;
        }
    }
    async updateVisualization(data, visualizationType) {
        try {
            this.logger.info('Updating visualization', { visualizationType });
            const visualization = {
                visualizationId: (0, uuid_1.v4)(),
                type: visualizationType,
                data,
                updatedDate: new Date(),
                config: this.getVisualizationConfig(visualizationType),
            };
            return visualization;
        }
        catch (error) {
            this.logger.error('Visualization update failed', error);
            throw error;
        }
    }
    async applyFilters(data, filterCriteria) {
        try {
            this.logger.info('Applying filters', { filterCount: Object.keys(filterCriteria).length });
            if (!Array.isArray(data)) {
                return data;
            }
            return data.filter((item) => {
                if (typeof item !== 'object' || item === null) {
                    return true;
                }
                const obj = item;
                for (const [key, value] of Object.entries(filterCriteria)) {
                    if (key in obj) {
                        if (typeof value === 'object' && value !== null) {
                            const filterObj = value;
                            if (filterObj.operator === 'equals' && obj[key] !== filterObj.value) {
                                return false;
                            }
                            if (filterObj.operator === 'contains' && !String(obj[key]).includes(String(filterObj.value))) {
                                return false;
                            }
                            if (filterObj.operator === 'gt' && obj[key] <= filterObj.value) {
                                return false;
                            }
                            if (filterObj.operator === 'lt' && obj[key] >= filterObj.value) {
                                return false;
                            }
                        }
                        else if (obj[key] !== value) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }
        catch (error) {
            this.logger.error('Filter application failed', error);
            throw error;
        }
    }
    getWidgetsForRole(role) {
        const baseWidgets = [
            { id: 'summary', title: 'Summary', type: 'card' },
            { id: 'alerts', title: 'Active Alerts', type: 'list' },
            { id: 'metrics', title: 'Key Metrics', type: 'chart' },
        ];
        const roleWidgets = {
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
    getVisualizationConfig(visualizationType) {
        const configs = {
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
exports.VisualizationComponent = VisualizationComponent;
//# sourceMappingURL=VisualizationComponent.js.map
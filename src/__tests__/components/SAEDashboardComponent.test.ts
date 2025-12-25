/**
 * SAE Dashboard Component Tests
 */

import { SAEDashboardComponent } from '../../components/SAEDashboardComponent';
import { AdverseEvent } from '../../types/index';

describe('SAEDashboardComponent', () => {
  let component: SAEDashboardComponent;

  beforeEach(() => {
    component = new SAEDashboardComponent();
  });

  describe('createSAERecord', () => {
    it('should create an SAE record', () => {
      const event: AdverseEvent = {
        eventId: 'AE001',
        patientId: 'P001',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Hospitalization required',
      };

      const record = component.createSAERecord(event);

      expect(record.eventId).toBe('AE001');
      expect(record.patientId).toBe('P001');
      expect(record.dmReviewStatus).toBe('pending_dm');
      expect(record.safetyReviewStatus).toBe('pending_safety');
    });
  });

  describe('updateDMReviewStatus', () => {
    it('should update DM review status', () => {
      const event: AdverseEvent = {
        eventId: 'AE002',
        patientId: 'P002',
        eventType: 'Serious Adverse Event',
        severity: 'critical',
        onsetDate: new Date(),
        description: 'Emergency hospitalization',
      };

      const record = component.createSAERecord(event);
      const updated = component.updateDMReviewStatus(record.saeId, 'reconciled');

      expect(updated.dmReviewStatus).toBe('reconciled');
    });
  });

  describe('updateSafetyReviewStatus', () => {
    it('should update Safety review status', () => {
      const event: AdverseEvent = {
        eventId: 'AE003',
        patientId: 'P003',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Severe reaction',
      };

      const record = component.createSAERecord(event);
      const updated = component.updateSafetyReviewStatus(record.saeId, 'reconciled');

      expect(updated.safetyReviewStatus).toBe('reconciled');
    });
  });

  describe('createDiscrepancy', () => {
    it('should create an SAE discrepancy', () => {
      const event: AdverseEvent = {
        eventId: 'AE004',
        patientId: 'P004',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Adverse event',
      };

      const record = component.createSAERecord(event);
      const discrepancy = component.createDiscrepancy(
        record.saeId,
        'onsetDate',
        '2024-01-15',
        '2024-01-16',
        'high'
      );

      expect(discrepancy.field).toBe('onsetDate');
      expect(discrepancy.dmValue).toBe('2024-01-15');
      expect(discrepancy.safetyValue).toBe('2024-01-16');
      expect(discrepancy.status).toBe('open');
    });
  });

  describe('resolveDiscrepancy', () => {
    it('should resolve a discrepancy', () => {
      const event: AdverseEvent = {
        eventId: 'AE005',
        patientId: 'P005',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Adverse event',
      };

      const record = component.createSAERecord(event);
      const discrepancy = component.createDiscrepancy(record.saeId, 'severity', 'high', 'critical', 'critical');
      const resolved = component.resolveDiscrepancy(discrepancy.discrepancyId, 'Corrected to critical');

      expect(resolved.status).toBe('resolved');
      expect(resolved.resolvedDate).toBeDefined();
    });
  });

  describe('getSAEMetrics', () => {
    it('should calculate SAE metrics', () => {
      const event1: AdverseEvent = {
        eventId: 'AE006',
        patientId: 'P006',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Event 1',
      };

      const event2: AdverseEvent = {
        eventId: 'AE007',
        patientId: 'P007',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Event 2',
      };

      const record1 = component.createSAERecord(event1);
      const record2 = component.createSAERecord(event2);

      component.updateDMReviewStatus(record1.saeId, 'reconciled');
      component.updateSafetyReviewStatus(record1.saeId, 'reconciled');

      const metrics = component.getSAEMetrics();

      expect(metrics.totalSAEs).toBe(2);
      expect(metrics.reconciledSAEs).toBe(1);
      expect(metrics.pendingDMReview).toBe(1);
    });

    it('should return zero metrics for empty component', () => {
      const metrics = component.getSAEMetrics();

      expect(metrics.totalSAEs).toBe(0);
      expect(metrics.reconciliationPercentage).toBe(0);
    });
  });

  describe('getOpenDiscrepancies', () => {
    it('should retrieve open discrepancies', () => {
      const event: AdverseEvent = {
        eventId: 'AE008',
        patientId: 'P008',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Event with discrepancy',
      };

      const record = component.createSAERecord(event);
      const disc1 = component.createDiscrepancy(record.saeId, 'field1', 'value1', 'value2', 'high');
      const disc2 = component.createDiscrepancy(record.saeId, 'field2', 'value3', 'value4', 'medium');

      component.resolveDiscrepancy(disc1.discrepancyId, 'Resolved');

      const openDiscrepancies = component.getOpenDiscrepancies(record.saeId);

      expect(openDiscrepancies).toHaveLength(1);
      expect(openDiscrepancies[0].discrepancyId).toBe(disc2.discrepancyId);
    });
  });

  describe('getCriticalDiscrepancies', () => {
    it('should retrieve critical discrepancies', () => {
      const event: AdverseEvent = {
        eventId: 'AE009',
        patientId: 'P009',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Event with critical discrepancy',
      };

      const record = component.createSAERecord(event);
      component.createDiscrepancy(record.saeId, 'field1', 'value1', 'value2', 'critical');
      component.createDiscrepancy(record.saeId, 'field2', 'value3', 'value4', 'high');

      const critical = component.getCriticalDiscrepancies();

      expect(critical).toHaveLength(1);
      expect(critical[0].severity).toBe('critical');
    });
  });

  describe('getSAEByPatient', () => {
    it('should retrieve SAEs by patient', () => {
      const event1: AdverseEvent = {
        eventId: 'AE010',
        patientId: 'P010',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Event 1',
      };

      const event2: AdverseEvent = {
        eventId: 'AE011',
        patientId: 'P010',
        eventType: 'Serious Adverse Event',
        severity: 'high',
        onsetDate: new Date(),
        description: 'Event 2',
      };

      component.createSAERecord(event1);
      component.createSAERecord(event2);

      const patientSAEs = component.getSAEByPatient('P010');

      expect(patientSAEs).toHaveLength(2);
      expect(patientSAEs.every((s) => s.patientId === 'P010')).toBe(true);
    });
  });
});

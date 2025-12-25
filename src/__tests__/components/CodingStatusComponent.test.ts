/**
 * Coding Status Component Tests
 */

import { CodingStatusComponent } from '../../components/CodingStatusComponent';

describe('CodingStatusComponent', () => {
  let component: CodingStatusComponent;

  beforeEach(() => {
    component = new CodingStatusComponent();
  });

  describe('createCodingRecord', () => {
    it('should create a coding record', () => {
      const record = component.createCodingRecord('Headache', 'meddra', 'uncoded');

      expect(record.term).toBe('Headache');
      expect(record.codingType).toBe('meddra');
      expect(record.status).toBe('uncoded');
      expect(record.codingId).toBeDefined();
    });
  });

  describe('updateCodingStatus', () => {
    it('should update coding status', () => {
      const record = component.createCodingRecord('Fever', 'meddra', 'uncoded');
      const updated = component.updateCodingStatus(record.codingId, 'coded', 'PT10016256', 'Pyrexia');

      expect(updated.status).toBe('coded');
      expect(updated.code).toBe('PT10016256');
      expect(updated.preferredTerm).toBe('Pyrexia');
    });

    it('should throw error for non-existent record', () => {
      expect(() => {
        component.updateCodingStatus('invalid_id', 'coded');
      }).toThrow();
    });
  });

  describe('verifyCodingRecord', () => {
    it('should verify a coding record', () => {
      const record = component.createCodingRecord('Nausea', 'meddra', 'coded');
      const verified = component.verifyCodingRecord(record.codingId, 'user123');

      expect(verified.status).toBe('verified');
      expect(verified.verifiedBy).toBe('user123');
      expect(verified.verifiedDate).toBeDefined();
    });
  });

  describe('getCodingStatusMetrics', () => {
    it('should calculate coding status metrics', () => {
      component.createCodingRecord('Headache', 'meddra', 'uncoded');
      component.createCodingRecord('Fever', 'meddra', 'coded');
      component.createCodingRecord('Nausea', 'meddra', 'verified');

      const metrics = component.getCodingStatusMetrics('meddra');

      expect(metrics.totalTerms).toBe(3);
      expect(metrics.uncodedTerms).toBe(1);
      expect(metrics.codedTerms).toBe(1);
      expect(metrics.verifiedTerms).toBe(1);
      expect(metrics.codingCompletionPercentage).toBeGreaterThan(0);
    });

    it('should return zero metrics for empty component', () => {
      const metrics = component.getCodingStatusMetrics();

      expect(metrics.totalTerms).toBe(0);
      expect(metrics.codingCompletionPercentage).toBe(0);
    });
  });

  describe('identifyUncodedTerms', () => {
    it('should identify uncoded terms', () => {
      component.createCodingRecord('Headache', 'meddra', 'uncoded');
      component.createCodingRecord('Fever', 'meddra', 'coded');
      component.createCodingRecord('Dizziness', 'meddra', 'uncoded');

      const uncoded = component.identifyUncodedTerms('meddra');

      expect(uncoded).toHaveLength(2);
      expect(uncoded.every((r) => r.status === 'uncoded')).toBe(true);
    });
  });

  describe('createCodingQuery', () => {
    it('should create a coding query', () => {
      const record = component.createCodingRecord('Rash', 'meddra', 'coded');
      const query = component.createCodingQuery(record.codingId, 'Unclear preferred term', 'high');

      expect(query.codingId).toBe(record.codingId);
      expect(query.issue).toBe('Unclear preferred term');
      expect(query.severity).toBe('high');
      expect(query.status).toBe('open');
    });
  });

  describe('resolveCodingQuery', () => {
    it('should resolve a coding query', () => {
      const record = component.createCodingRecord('Pain', 'meddra', 'coded');
      const query = component.createCodingQuery(record.codingId, 'Ambiguous term', 'medium');
      const resolved = component.resolveCodingQuery(query.queryId);

      expect(resolved.status).toBe('resolved');
      expect(resolved.resolvedDate).toBeDefined();
    });
  });

  describe('getOpenCodingQueries', () => {
    it('should retrieve open coding queries', () => {
      const record1 = component.createCodingRecord('Cough', 'meddra', 'coded');
      const record2 = component.createCodingRecord('Fatigue', 'who_drug', 'coded');

      component.createCodingQuery(record1.codingId, 'Issue 1', 'high');
      component.createCodingQuery(record2.codingId, 'Issue 2', 'medium');

      const openQueries = component.getOpenCodingQueries('meddra');

      expect(openQueries).toHaveLength(1);
      expect(openQueries[0].codingId).toBe(record1.codingId);
    });
  });

  describe('getCodingQuerySummary', () => {
    it('should generate coding query summary', () => {
      const record = component.createCodingRecord('Tremor', 'meddra', 'coded');
      const query1 = component.createCodingQuery(record.codingId, 'Issue 1', 'critical');
      const query2 = component.createCodingQuery(record.codingId, 'Issue 2', 'high');

      component.resolveCodingQuery(query1.queryId);

      const summary = component.getCodingQuerySummary();

      expect(summary.total).toBe(2);
      expect(summary.open).toBe(1);
      expect(summary.resolved).toBe(1);
      expect(summary.critical).toBe(1);
    });
  });
});

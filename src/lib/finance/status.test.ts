import { describe, it, expect } from 'vitest';
import { effectiveStatus } from '@/lib/finance/status';

describe('effectiveStatus', () => {
  const today = '2026-06-17';

  it('returns overdue when pending and due date is in the past', () => {
    expect(effectiveStatus('pending', '2026-06-16', today)).toBe('overdue');
  });

  it('returns pending when due date is today', () => {
    expect(effectiveStatus('pending', '2026-06-17', today)).toBe('pending');
  });

  it('returns pending when due date is in the future', () => {
    expect(effectiveStatus('pending', '2026-06-30', today)).toBe('pending');
  });

  it('never marks a paid entry as overdue', () => {
    expect(effectiveStatus('paid', '2026-01-01', today)).toBe('paid');
  });

  it('never marks a canceled entry as overdue', () => {
    expect(effectiveStatus('canceled', '2026-01-01', today)).toBe('canceled');
  });

  it('defaults todayISO to today when omitted', () => {
    // A far-future due date should never be overdue regardless of today
    const result = effectiveStatus('pending', '2099-12-31');
    expect(result).toBe('pending');
  });
});

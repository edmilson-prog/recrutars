import { describe, it, expect } from 'vitest';
import {
  getEffectiveStatus,
  isOverdue,
  daysUntilDue,
  bucketForEntry,
} from './entryStatus';

const T = new Date(2026, 5, 17); // 2026-06-17 local (mes 0-based)

describe('getEffectiveStatus', () => {
  it('mantem paid', () => {
    expect(getEffectiveStatus({ status: 'paid', dueDate: '2026-06-01' }, T)).toBe('paid');
  });
  it('mantem canceled', () => {
    expect(getEffectiveStatus({ status: 'canceled', dueDate: '2026-06-01' }, T)).toBe('canceled');
  });
  it('pending com vencimento no passado vira overdue', () => {
    expect(getEffectiveStatus({ status: 'pending', dueDate: '2026-06-16' }, T)).toBe('overdue');
  });
  it('pending vencendo hoje continua pending (nao atrasado)', () => {
    expect(getEffectiveStatus({ status: 'pending', dueDate: '2026-06-17' }, T)).toBe('pending');
  });
  it('pending com vencimento futuro continua pending', () => {
    expect(getEffectiveStatus({ status: 'pending', dueDate: '2026-06-30' }, T)).toBe('pending');
  });
});

describe('isOverdue', () => {
  it('true so para pending vencido', () => {
    expect(isOverdue({ status: 'pending', dueDate: '2026-06-16' }, T)).toBe(true);
    expect(isOverdue({ status: 'pending', dueDate: '2026-06-18' }, T)).toBe(false);
    expect(isOverdue({ status: 'paid', dueDate: '2026-06-01' }, T)).toBe(false);
  });
});

describe('daysUntilDue', () => {
  it('0 no dia, negativo no passado, positivo no futuro', () => {
    expect(daysUntilDue({ dueDate: '2026-06-17' }, T)).toBe(0);
    expect(daysUntilDue({ dueDate: '2026-06-16' }, T)).toBe(-1);
    expect(daysUntilDue({ dueDate: '2026-06-24' }, T)).toBe(7);
  });
});

describe('bucketForEntry', () => {
  // Vocabulario unificado com DueWindow (task 1.11) + paid/canceled.
  // Nada de 'other': cancelado e futuro sao buckets distintos, senao a view
  // Fluxo esconderia lancamentos (mesmo principio que exige a secao Cancelados).
  it('paid -> paid', () => {
    expect(bucketForEntry({ status: 'paid', dueDate: '2026-06-01' }, T)).toBe('paid');
  });
  it('canceled -> canceled', () => {
    expect(bucketForEntry({ status: 'canceled', dueDate: '2026-06-01' }, T)).toBe('canceled');
  });
  it('pending vencido -> overdue', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-16' }, T)).toBe('overdue');
  });
  it('pending vencendo em 0..7 dias -> due7', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-17' }, T)).toBe('due7');
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-24' }, T)).toBe('due7');
  });
  it('pending vencendo em 8..30 dias -> due8_30', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-25' }, T)).toBe('due8_30');
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-07-17' }, T)).toBe('due8_30');
  });
  it('pending vencendo alem de 30 dias -> future', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-08-01' }, T)).toBe('future');
  });
});

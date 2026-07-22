import { describe, it, expect } from 'vitest';
import { effectiveStatus, dueWindowOf, daysBetween, daysUntil, todayISO } from '@/lib/finance/status';

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

describe('daysBetween', () => {
  it('conta dias entre datas ISO ignorando timezone', () => {
    expect(daysBetween('2026-07-21', '2026-07-28')).toBe(7);
    expect(daysBetween('2026-07-28', '2026-07-21')).toBe(-7);
    expect(daysBetween('2026-07-21', '2026-07-21')).toBe(0);
  });

  it('atravessa virada de mes e de ano', () => {
    expect(daysBetween('2026-07-31', '2026-08-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('dueWindowOf', () => {
  const TODAY = '2026-07-21';

  it('classifica pendente vencido como overdue', () => {
    expect(dueWindowOf('pending', '2026-07-20', TODAY)).toBe('overdue');
  });

  it('classifica vencimento hoje e ate 7 dias como due7', () => {
    expect(dueWindowOf('pending', TODAY, TODAY)).toBe('due7');
    expect(dueWindowOf('pending', '2026-07-28', TODAY)).toBe('due7');
  });

  it('classifica 8 a 30 dias como due8_30', () => {
    expect(dueWindowOf('pending', '2026-07-29', TODAY)).toBe('due8_30');
    expect(dueWindowOf('pending', '2026-08-20', TODAY)).toBe('due8_30');
  });

  it('classifica alem de 30 dias como future', () => {
    expect(dueWindowOf('pending', '2026-08-21', TODAY)).toBe('future');
  });

  it('retorna null para pago e cancelado, mesmo vencidos', () => {
    expect(dueWindowOf('paid', '2026-07-01', TODAY)).toBeNull();
    expect(dueWindowOf('canceled', '2026-07-01', TODAY)).toBeNull();
  });
});

describe('todayISO', () => {
  it('retorna a data LOCAL no formato YYYY-MM-DD', () => {
    const iso = todayISO();
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Deve casar com a data local, nao com a UTC. Em UTC-3 as duas divergem
    // depois das 21h: usar toISOString() faria "hoje" adiantar um dia e
    // marcaria como atrasado um lancamento que vence hoje.
    const now = new Date();
    const local = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    expect(iso).toBe(local);
  });
});

describe('daysUntil', () => {
  const TODAY = '2026-07-21';

  it('positivo para futuro, negativo para atrasado, zero para hoje', () => {
    expect(daysUntil('2026-07-28', TODAY)).toBe(7);
    expect(daysUntil('2026-07-20', TODAY)).toBe(-1);
    expect(daysUntil(TODAY, TODAY)).toBe(0);
  });
});

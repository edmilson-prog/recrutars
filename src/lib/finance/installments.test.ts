import { describe, it, expect } from 'vitest';
import { calcInstallments, addByFrequency } from './installments';

describe('addByFrequency', () => {
  it('soma meses (monthly) com intervalo 1', () => {
    expect(addByFrequency('2026-01-15', 'monthly', 1)).toBe('2026-02-15');
  });

  it('soma meses (monthly) com intervalo 0 mantem a data', () => {
    expect(addByFrequency('2026-01-15', 'monthly', 0)).toBe('2026-01-15');
  });

  it('faz clamp para o ultimo dia do mes quando o dia nao existe', () => {
    // 31/jan + 1 mes -> fev nao tem dia 31 -> 28 (2026 nao e bissexto)
    expect(addByFrequency('2026-01-31', 'monthly', 1)).toBe('2026-02-28');
  });

  it('soma trimestres (quarterly = 3 meses por intervalo)', () => {
    expect(addByFrequency('2026-01-10', 'quarterly', 2)).toBe('2026-07-10');
  });

  it('soma anos (yearly = 12 meses por intervalo)', () => {
    expect(addByFrequency('2026-03-01', 'yearly', 1)).toBe('2027-03-01');
  });

  it('soma semanas (weekly = 7 dias por intervalo)', () => {
    expect(addByFrequency('2026-01-01', 'weekly', 2)).toBe('2026-01-15');
  });
});

describe('calcInstallments', () => {
  it('divide valor exato igualmente', () => {
    const items = calcInstallments(30000, 3, '2026-01-10', 'monthly', 1);
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.amount)).toEqual([100, 100, 100]);
    expect(items.map((i) => i.number)).toEqual([1, 2, 3]);
    expect(items.map((i) => i.dueDate)).toEqual(['2026-01-10', '2026-02-10', '2026-03-10']);
  });

  it('joga o resto dos centavos na ULTIMA parcela', () => {
    // 100,00 / 3 = 33,33 + 33,33 + 33,34
    const items = calcInstallments(10000, 3, '2026-01-10', 'monthly', 1);
    expect(items.map((i) => i.amount)).toEqual([33.33, 33.33, 33.34]);
    const sum = items.reduce((s, i) => s + Math.round(i.amount * 100), 0);
    expect(sum).toBe(10000);
  });

  it('soma exata em qualquer divisao (10,01 em 3)', () => {
    const items = calcInstallments(1001, 3, '2026-05-05', 'monthly', 1);
    const sum = items.reduce((s, i) => s + Math.round(i.amount * 100), 0);
    expect(sum).toBe(1001);
    expect(items[2].amount).toBeCloseTo(3.35, 2);
  });

  it('1 parcela retorna o total integral', () => {
    const items = calcInstallments(4990, 1, '2026-02-01', 'monthly', 1);
    expect(items).toEqual([{ number: 1, dueDate: '2026-02-01', amount: 49.9 }]);
  });

  it('respeita intervalo > 1 (a cada 2 meses)', () => {
    const items = calcInstallments(20000, 2, '2026-01-31', 'monthly', 2);
    expect(items.map((i) => i.dueDate)).toEqual(['2026-01-31', '2026-03-31']);
  });

  it('lanca erro para count < 1', () => {
    expect(() => calcInstallments(1000, 0, '2026-01-01', 'monthly', 1)).toThrow();
  });
});

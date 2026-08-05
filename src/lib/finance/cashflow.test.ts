import { describe, it, expect } from 'vitest';
import { aggregateCashflow } from './cashflow';
import type { FinancialEntry } from '@/types/finance';

function entry(p: Partial<FinancialEntry>): FinancialEntry {
  return {
    id: p.id ?? crypto.randomUUID(),
    type: p.type ?? 'expense',
    status: p.status ?? 'pending',
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    description: p.description ?? 'x',
    amount: p.amount ?? 0,
    currency: 'BRL',
    competenceDate: p.competenceDate ?? '2026-06-01',
    dueDate: p.dueDate ?? '2026-06-20',
    paidDate: p.paidDate,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  } as FinancialEntry;
}

const PARAMS = { from: '2026-06-01', to: '2026-06-30', today: '2026-06-17' };

describe('aggregateCashflow', () => {
  it('soma income e expense ignorando cancelados', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'income', amount: 1000, status: 'paid' }),
        entry({ type: 'expense', amount: 300, status: 'pending' }),
        entry({ type: 'expense', amount: 999, status: 'canceled' }),
      ],
      PARAMS,
    );
    expect(r.totalIncome).toBe(1000);
    expect(r.totalExpense).toBe(300);
    expect(r.balance).toBe(700);
  });

  it('cashBalance considera apenas pagos', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'income', amount: 500, status: 'paid', paidDate: '2026-06-05' }),
        entry({ type: 'income', amount: 800, status: 'pending' }),
        entry({ type: 'expense', amount: 200, status: 'paid', paidDate: '2026-06-06' }),
      ],
      PARAMS,
    );
    expect(r.cashBalance).toBe(300);
  });

  it('deriva overdue (pending + due passado)', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'expense', amount: 100, status: 'pending', dueDate: '2026-06-10' }),
        entry({ type: 'expense', amount: 50, status: 'pending', dueDate: '2026-06-25' }),
      ],
      PARAMS,
    );
    expect(r.overdueAmount).toBe(100);
    expect(r.overdueCount).toBe(1);
  });

  it('conta a vencer em 7 dias (inclui hoje e D+7)', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'expense', amount: 10, status: 'pending', dueDate: '2026-06-17' }),
        entry({ type: 'expense', amount: 20, status: 'pending', dueDate: '2026-06-24' }),
        entry({ type: 'expense', amount: 40, status: 'pending', dueDate: '2026-06-25' }),
      ],
      PARAMS,
    );
    expect(r.dueSoon7Count).toBe(2);
    expect(r.dueSoon7Amount).toBe(30);
  });

  it('agrupa despesas por categoria', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'expense', amount: 100, categoryId: 'c1', categoryName: 'Marketing' }),
        entry({ type: 'expense', amount: 50, categoryId: 'c1', categoryName: 'Marketing' }),
        entry({ type: 'expense', amount: 70, categoryId: 'c2', categoryName: 'Infra' }),
      ],
      PARAMS,
    );
    const marketing = r.byCategory.find((c) => c.categoryId === 'c1');
    expect(marketing?.total).toBe(150);
    expect(r.byCategory).toHaveLength(2);
  });

  it('monta buckets mensais por competencia', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'income', amount: 1000, competenceDate: '2026-06-10' }),
        entry({ type: 'expense', amount: 400, competenceDate: '2026-06-12' }),
      ],
      PARAMS,
    );
    const jun = r.monthly.find((m) => m.month === '2026-06');
    expect(jun?.income).toBe(1000);
    expect(jun?.expense).toBe(400);
  });

  it('repassa o mrr informado', () => {
    const r = aggregateCashflow([], PARAMS, 12345);
    expect(r.mrr).toBe(12345);
  });
});

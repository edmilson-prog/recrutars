/**
 * Lancamentos Financeiros — agregacao pura do resumo de fluxo de caixa.
 *
 * Recebe os lancamentos JA filtrados pelo periodo e devolve o CashflowSummary.
 * Sem dependencia de Supabase ou React: e a parte testavel do dashboard.
 *
 * Convencoes que esta funcao respeita (e que a UI depende):
 * - `canceled` nunca soma em lugar nenhum;
 * - `overdue` e DERIVADO via effectiveStatus, jamais lido de uma coluna;
 * - `cashBalance` e caixa REALIZADO: so entra o que esta `paid`.
 */

import type { CashflowSummary, FinancialEntry } from '@/types/finance';
import { effectiveStatus, daysUntil } from '@/lib/finance/status';

export interface AggregateParams {
  from: string;
  to: string;
  today?: string;
}

export function aggregateCashflow(
  entries: FinancialEntry[],
  params: AggregateParams,
  mrr = 0,
): CashflowSummary {
  const active = entries.filter((e) => e.status !== 'canceled');

  let totalIncome = 0;
  let totalExpense = 0;
  let paidIncome = 0;
  let paidExpense = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let dueSoon7Amount = 0;
  let dueSoon7Count = 0;

  const categories = new Map<string, { categoryId: string; name: string; total: number }>();
  const months = new Map<string, { income: number; expense: number }>();

  for (const e of active) {
    const isIncome = e.type === 'income';

    if (isIncome) totalIncome += e.amount;
    else totalExpense += e.amount;

    if (e.status === 'paid') {
      if (isIncome) paidIncome += e.amount;
      else paidExpense += e.amount;
    }

    // Atraso e proximidade de vencimento sao derivados, nunca armazenados.
    if (effectiveStatus(e.status, e.dueDate, params.today) === 'overdue') {
      overdueAmount += e.amount;
      overdueCount += 1;
    } else if (e.status === 'pending') {
      const days = daysUntil(e.dueDate, params.today);
      if (days >= 0 && days <= 7) {
        dueSoon7Amount += e.amount;
        dueSoon7Count += 1;
      }
    }

    // Composicao por categoria: so despesas (o donut do dashboard e de saidas).
    if (!isIncome && e.categoryId) {
      const cur = categories.get(e.categoryId);
      if (cur) cur.total += e.amount;
      else
        categories.set(e.categoryId, {
          categoryId: e.categoryId,
          name: e.categoryName ?? 'Sem categoria',
          total: e.amount,
        });
    }

    // Buckets mensais por COMPETENCIA (regime de competencia, nao de caixa).
    const month = e.competenceDate.slice(0, 7);
    const bucket = months.get(month) ?? { income: 0, expense: 0 };
    if (isIncome) bucket.income += e.amount;
    else bucket.expense += e.amount;
    months.set(month, bucket);
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    cashBalance: paidIncome - paidExpense,
    overdueAmount,
    overdueCount,
    dueSoon7Amount,
    dueSoon7Count,
    byCategory: [...categories.values()].sort((a, b) => b.total - a.total),
    // assinaturas/avulsos/projected ficam zerados aqui: quem cruza com o Stripe
    // e a camada de dashboard, que enriquece estes buckets.
    monthly: [...months.entries()]
      .map(([month, v]) => ({
        month,
        assinaturas: 0,
        avulsos: 0,
        income: v.income,
        expense: v.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    mrr,
  };
}

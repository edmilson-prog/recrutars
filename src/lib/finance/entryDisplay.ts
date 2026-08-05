/**
 * Metadados de exibicao para lancamentos financeiros: labels PT-BR, classes de
 * badge (status) e formatacao de valor com sinal pela natureza.
 *
 * Territorio de cor (spec, secao 9):
 * - o VALOR usa os tokens --fin-income / --fin-expense (teal/coral calibrados),
 *   NAO emerald/red — via as classes tailwind text-fin-income / text-fin-expense;
 * - o STATUS usa tint + icone proprio (dupla codificacao para daltonismo);
 * - o sinal de despesa e U+2212 (menos), nao hifen: em Roboto Mono tem a mesma
 *   largura e e visivelmente mais longo.
 */

import {
  CheckCircle2, Clock, AlertTriangle, Ban,
  type LucideIcon,
} from 'lucide-react';
import type {
  EntryStatus, EffectiveStatus, PaymentMethod, FinancialType,
} from '@/types/finance';
import { formatBRL } from '@/lib/formatters';

interface StatusMeta {
  label: string;
  className: string;
  icon: LucideIcon;
}

export const EFFECTIVE_STATUS_META: Record<EffectiveStatus, StatusMeta> = {
  paid: {
    label: 'Pago',
    className: 'bg-success/12 text-success',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendente',
    className: 'bg-warning/14 text-warning',
    icon: Clock,
  },
  overdue: {
    label: 'Atrasado',
    className: 'bg-destructive/14 text-fin-expense',
    icon: AlertTriangle,
  },
  canceled: {
    label: 'Cancelado',
    className: 'bg-muted-foreground/14 text-muted-foreground',
    icon: Ban,
  },
};

/** Subconjunto usado em filtros que so aceitam status armazenado. */
export const STATUS_META: Record<EntryStatus, StatusMeta> = {
  paid: EFFECTIVE_STATUS_META.paid,
  pending: EFFECTIVE_STATUS_META.pending,
  canceled: EFFECTIVE_STATUS_META.canceled,
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card_credit: 'Cartão de crédito',
  card_debit: 'Cartão de débito',
  pix: 'Pix',
  boleto: 'Boleto',
  transfer: 'Transferência',
  cash: 'Dinheiro',
  other: 'Outro',
};

export const TYPE_META: Record<
  FinancialType,
  { label: string; amountClass: string; sign: string }
> = {
  income: { label: 'Receita', amountClass: 'text-fin-income', sign: '+' },
  expense: { label: 'Despesa', amountClass: 'text-fin-expense', sign: '−' },
};

/** Valor em BRL com sinal pela natureza (+ receita / − despesa, U+2212). */
export function formatSignedBRL(type: FinancialType, amount: number): string {
  const { sign } = TYPE_META[type];
  return `${sign} ${formatBRL(Math.abs(amount))}`;
}

/** "06/2026" a partir de uma data de competência date-only. */
export function formatCompetencePeriod(competenceDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(competenceDate)) {
    const [y, m] = competenceDate.split('-');
    return `${m}/${y}`;
  }
  const d = new Date(competenceDate);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

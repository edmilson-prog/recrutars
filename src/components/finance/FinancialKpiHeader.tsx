/**
 * FinancialKpiHeader — KPIs por horizonte para a tela de lançamentos.
 *
 * Revisado 21/07 (spec, seção 7.1/7.3): são 4 KPIs, não 5. "A vencer 7d" saiu
 * (duplicava a faixa/filtro de vencimento). Hierarquia do herói por COR +
 * ELEVAÇÃO, não por tamanho: só "Saldo do período" tem valor colorido (pela
 * natureza do sinal) e borda/superfície sólida; Entradas e Saídas ficam em
 * foreground neutro; "Vencido" é a exceção que alarma (fin-expense) e é o único
 * clicável — seta o filtro de vencimento no container pai.
 */

import { motion } from 'framer-motion';
import { Scale, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { isOverdue, getEffectiveStatus } from '@/lib/finance/entryStatus';
import type { FinancialEntry } from '@/types/finance';

interface FinancialKpis {
  balance: number;
  income: number;
  expense: number;
  overdueAmount: number;
  overdueCount: number;
}

/** Agrega KPIs da lista atual (filtrada). Cancelados não somam. */
function computeKpisFromEntries(
  entries: FinancialEntry[],
  today: Date = new Date(),
): FinancialKpis {
  let income = 0;
  let expense = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  for (const e of entries) {
    if (getEffectiveStatus(e, today) === 'canceled') continue;
    if (e.type === 'income') income += e.amount;
    else expense += e.amount;

    if (isOverdue(e, today)) {
      overdueAmount += e.amount;
      overdueCount += 1;
    }
  }

  return { balance: income - expense, income, expense, overdueAmount, overdueCount };
}

interface FinancialKpiHeaderProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  /** Clique em "Vencido" — aplica o filtro de vencimento (dueWindow) no pai. */
  onSelectOverdue: () => void;
}

function pluralLancamentos(n: number): string {
  return `${n} ${n === 1 ? 'lançamento' : 'lançamentos'}`;
}

export function FinancialKpiHeader({ entries, isLoading, onSelectOverdue }: FinancialKpiHeaderProps) {
  const kpis = computeKpisFromEntries(entries);

  const cards: Array<{
    key: string;
    title: string;
    value: string;
    sub?: string;
    icon: typeof Scale;
    valueClass?: string;
    hero?: boolean;
    heroBorder?: string;
    onClick?: () => void;
  }> = [
    {
      key: 'balance',
      title: 'Saldo do período',
      value: formatBRL(kpis.balance),
      icon: Scale,
      hero: true,
      heroBorder: kpis.balance >= 0 ? 'border-l-fin-income' : 'border-l-fin-expense',
      valueClass: kpis.balance >= 0 ? 'text-fin-income' : 'text-fin-expense',
    },
    {
      key: 'income',
      title: 'Entradas',
      value: formatBRL(kpis.income),
      icon: ArrowUpCircle,
      valueClass: 'text-foreground',
    },
    {
      key: 'expense',
      title: 'Saídas',
      value: formatBRL(kpis.expense),
      icon: ArrowDownCircle,
      valueClass: 'text-foreground',
    },
    {
      key: 'overdue',
      title: 'Vencido',
      value: formatBRL(kpis.overdueAmount),
      sub: pluralLancamentos(kpis.overdueCount),
      icon: AlertTriangle,
      valueClass: 'text-fin-expense',
      onClick: onSelectOverdue,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const interactive = !!c.onClick;
        const inner = (
          <CardContent className={cn('p-4', c.hero && 'py-5')}>
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-wide">{c.title}</span>
            </div>
            <div
              className={cn(
                'truncate font-bold tabular-nums',
                c.hero ? 'text-3xl' : 'text-xl',
                c.valueClass,
              )}
            >
              {isLoading ? '—' : c.value}
            </div>
            {c.sub && <div className="mt-0.5 text-xs text-muted-foreground">{c.sub}</div>}
          </CardContent>
        );

        const cardEl = (
          <Card
            className={cn(
              'transition-shadow',
              c.hero
                ? cn('border-l-[3px] shadow-sm', c.heroBorder)
                : 'bg-transparent',
              interactive && 'hover:shadow-md hover:ring-1 hover:ring-primary/30',
              c.key === 'overdue' && 'border-destructive/35',
            )}
          >
            {inner}
          </Card>
        );

        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            {interactive ? (
              <button
                type="button"
                onClick={c.onClick}
                className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Filtrar por ${c.title}`}
              >
                {cardEl}
              </button>
            ) : (
              cardEl
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

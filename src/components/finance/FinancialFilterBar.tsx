/**
 * FinancialFilterBar — filtros da tela de lançamentos.
 *
 * ⚠️ Status e vencimento são DOIS eixos ortogonais (spec, seção 7.1):
 * - Status filtra o valor armazenado (pending/paid/canceled) → filters.status.
 * - Vencimento é derivado e combinável (atrasados/7d/8-30d/futuros) →
 *   filters.dueWindow. 'overdue' NÃO é um status.
 * Um select em estado neutro não recebe destaque de cor; só o de vencimento
 * ativo fica com a borda cyan (senão um filtro vazio parece aplicado).
 */

import { Search, X, AlertTriangle, CalendarClock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFinancialCategories } from '@/hooks/useFinancialCategoriesQuery';
import { STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META } from '@/lib/finance/entryDisplay';
import { cn } from '@/lib/utils';
import type {
  EntryFilters, FinancialType, EntryStatus, PaymentMethod, DueWindow,
} from '@/types/finance';

interface FinancialFilterBarProps {
  filters: EntryFilters;
  onChange: (next: EntryFilters) => void;
  onApplyPreset: (preset: 'overdue' | 'due7') => void;
}

const ALL = '__all__';

const STATUSES: EntryStatus[] = ['pending', 'paid', 'canceled'];
const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

const DUE_WINDOW_LABELS: Record<DueWindow, string> = {
  overdue: 'Atrasados',
  due7: 'Vencem em 7 dias',
  due8_30: '8 a 30 dias',
  future: 'Futuros',
};
const DUE_WINDOWS = Object.keys(DUE_WINDOW_LABELS) as DueWindow[];

export function FinancialFilterBar({ filters, onChange, onApplyPreset }: FinancialFilterBarProps) {
  const { data: categories = [] } = useFinancialCategories();

  const set = (patch: Partial<EntryFilters>) => onChange({ ...filters, ...patch });

  const clearAll = () => onChange({ dateField: filters.dateField ?? 'due' });

  const categoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name ?? 'Categoria';

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (filters.type)
    chips.push({ key: 'type', label: `Natureza: ${TYPE_META[filters.type].label.toLowerCase()}`, onRemove: () => set({ type: undefined }) });
  if (filters.status)
    chips.push({ key: 'status', label: `Status: ${STATUS_META[filters.status].label.toLowerCase()}`, onRemove: () => set({ status: undefined }) });
  if (filters.dueWindow)
    chips.push({ key: 'due', label: `Vencimento: ${DUE_WINDOW_LABELS[filters.dueWindow].toLowerCase()}`, onRemove: () => set({ dueWindow: undefined }) });
  if (filters.categoryId)
    chips.push({ key: 'cat', label: categoryName(filters.categoryId), onRemove: () => set({ categoryId: undefined }) });
  if (filters.paymentMethod)
    chips.push({ key: 'pm', label: PAYMENT_METHOD_LABELS[filters.paymentMethod], onRemove: () => set({ paymentMethod: undefined }) });
  if (filters.dateFrom)
    chips.push({ key: 'from', label: `De ${filters.dateFrom}`, onRemove: () => set({ dateFrom: undefined }) });
  if (filters.dateTo)
    chips.push({ key: 'to', label: `Até ${filters.dateTo}`, onRemove: () => set({ dateTo: undefined }) });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        {/* Busca */}
        <div className="relative flex-1 lg:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search ?? ''}
            onChange={(e) => set({ search: e.target.value || undefined })}
            placeholder="Buscar por descrição ou contraparte..."
            className="pl-9"
            aria-label="Buscar lançamentos"
          />
        </div>

        {/* Natureza */}
        <Select value={filters.type ?? ALL} onValueChange={(v) => set({ type: v === ALL ? undefined : (v as FinancialType) })}>
          <SelectTrigger className="w-full lg:w-[150px]" aria-label="Natureza"><SelectValue placeholder="Natureza" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as naturezas</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>

        {/* Status (apenas armazenado) */}
        <Select value={filters.status ?? ALL} onValueChange={(v) => set({ status: v === ALL ? undefined : (v as EntryStatus) })}>
          <SelectTrigger className="w-full lg:w-[150px]" aria-label="Status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Vencimento (eixo derivado, combinável com status) */}
        <Select value={filters.dueWindow ?? ALL} onValueChange={(v) => set({ dueWindow: v === ALL ? undefined : (v as DueWindow) })}>
          <SelectTrigger
            className={cn('w-full lg:w-[170px]', filters.dueWindow && 'border-secondary/60 text-secondary')}
            aria-label="Vencimento"
          >
            <SelectValue placeholder="Vencimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os vencimentos</SelectItem>
            {DUE_WINDOWS.map((w) => (
              <SelectItem key={w} value={w}>{DUE_WINDOW_LABELS[w]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Categoria */}
        <Select value={filters.categoryId ?? ALL} onValueChange={(v) => set({ categoryId: v === ALL ? undefined : v })}>
          <SelectTrigger className="w-full lg:w-[170px]" aria-label="Categoria"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Forma de pagamento */}
        <Select value={filters.paymentMethod ?? ALL} onValueChange={(v) => set({ paymentMethod: v === ALL ? undefined : (v as PaymentMethod) })}>
          <SelectTrigger className="w-full lg:w-[170px]" aria-label="Forma de pagamento"><SelectValue placeholder="Forma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as formas</SelectItem>
            {PAYMENT_METHODS.map((pm) => (
              <SelectItem key={pm} value={pm}>{PAYMENT_METHOD_LABELS[pm]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campo de data + range */}
        <Select value={filters.dateField ?? 'due'} onValueChange={(v) => set({ dateField: v as 'due' | 'competence' })}>
          <SelectTrigger className="w-full lg:w-[150px]" aria-label="Campo de data"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="due">Vencimento</SelectItem>
            <SelectItem value="competence">Competência</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={filters.dateFrom ?? ''} onChange={(e) => set({ dateFrom: e.target.value || undefined })} className="w-full lg:w-[150px]" aria-label="Data inicial" />
        <Input type="date" value={filters.dateTo ?? ''} onChange={(e) => set({ dateTo: e.target.value || undefined })} className="w-full lg:w-[150px]" aria-label="Data final" />
      </div>

      {/* Presets + chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Presets:</span>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onApplyPreset('overdue')}>
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Atrasados
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onApplyPreset('due7')}>
          <CalendarClock className="h-3.5 w-3.5 text-warning" /> A vencer 7d
        </Button>

        {chips.length > 0 && <div className="mx-1 h-4 w-px bg-border" />}
        {chips.map((chip) => (
          <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              className="rounded-sm hover:bg-muted-foreground/20"
              aria-label={`Remover filtro ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {chips.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
            Limpar tudo
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Period Filter
 * PRD-052: Filtro de período reutilizável
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PeriodFilter as PeriodFilterType } from '@/types/companyTest';

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (value: PeriodFilterType) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodFilterType)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Últimos 7 dias</SelectItem>
        <SelectItem value="30d">Últimos 30 dias</SelectItem>
        <SelectItem value="90d">Últimos 90 dias</SelectItem>
        <SelectItem value="all">Todos</SelectItem>
      </SelectContent>
    </Select>
  );
}

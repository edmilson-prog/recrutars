/**
 * TicketListFilters Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Filter bar for admin ticket listing (status, priority, requester type, SLA, search).
 */

import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AdminTicketFilters } from '@/types/help';
import {
  ticketStatusLabels,
  ticketPriorityLabels,
  requesterTypeLabels,
} from '@/types/help';

interface TicketListFiltersProps {
  filters: AdminTicketFilters;
  onFiltersChange: (filters: AdminTicketFilters) => void;
}

export function TicketListFilters({ filters, onFiltersChange }: TicketListFiltersProps) {
  const updateFilter = (key: keyof AdminTicketFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
      page: 1, // reset page on filter change
    });
  };

  const activeFilterCount = [
    filters.status && filters.status !== 'all',
    filters.priority && filters.priority !== 'all',
    filters.requesterType && filters.requesterType !== 'all',
    filters.slaStatus && filters.slaStatus !== 'all',
    filters.search,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({ page: 1, pageSize: filters.pageSize });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por assunto..."
            value={filters.search ?? ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined, page: 1 })}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) => updateFilter('status', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(ticketStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={filters.priority ?? 'all'}
          onValueChange={(v) => updateFilter('priority', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(ticketPriorityLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Requester Type */}
        <Select
          value={filters.requesterType ?? 'all'}
          onValueChange={(v) => updateFilter('requesterType', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(requesterTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SLA Status */}
        <Select
          value={filters.slaStatus ?? 'all'}
          onValueChange={(v) => updateFilter('slaStatus', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="SLA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="on_track">No prazo</SelectItem>
            <SelectItem value="warning">Atenção</SelectItem>
            <SelectItem value="breached">Violado</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
            <X className="h-3.5 w-3.5" />
            Limpar
            <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Invitation Manager Filters
 * Barra de filtros: Status multi-select, Canal toggle, Busca, Data range
 */

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, SlidersHorizontal, X, Check, Mail, MessageSquare, MessageCircle, Link2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvitationManagerFilters as FiltersType, InvitationStatus, InvitationMethod } from '@/types/companyTest';
import { invitationStatusConfig } from './InvitationStatusBadge';

interface InvitationManagerFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

const statusOptions: { value: InvitationStatus; label: string }[] = [
  { value: 'sent', label: 'Enviado' },
  { value: 'viewed', label: 'Acessado' },
  { value: 'started', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'expired', label: 'Expirado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'abandoned', label: 'Abandonado' },
];

export function InvitationManagerFilters({ filters, onChange }: InvitationManagerFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [statusOpen, setStatusOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search ?? '')) {
        onChange({ ...filters, search: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleStatus = useCallback((status: InvitationStatus) => {
    const current = filters.status ?? [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onChange({ ...filters, status: updated.length > 0 ? updated : undefined, page: 1 });
  }, [filters, onChange]);

  const handleChannelChange = useCallback((value: string) => {
    const method = value === 'all' ? undefined : [value as InvitationMethod];
    onChange({ ...filters, method: method, page: 1 });
  }, [filters, onChange]);

  const hasActiveFilters = (filters.status && filters.status.length > 0)
    || (filters.method && filters.method.length > 0)
    || filters.search
    || filters.dateFrom
    || filters.dateTo;

  const clearFilters = useCallback(() => {
    setSearchInput('');
    onChange({ page: 1, pageSize: filters.pageSize });
  }, [filters.pageSize, onChange]);

  const currentChannel = filters.method?.[0] ?? 'all';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status multi-select */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[140px] justify-start">
              <SlidersHorizontal className="h-4 w-4" />
              Status
              {filters.status && filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>Nenhum status encontrado</CommandEmpty>
                <CommandGroup>
                  {statusOptions.map((option) => {
                    const isSelected = filters.status?.includes(option.value) ?? false;
                    const config = invitationStatusConfig[option.value];
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleStatus(option.value)}
                      >
                        <div className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                          isSelected ? 'bg-primary border-primary text-primary-foreground' : 'opacity-50'
                        )}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        {config && <config.icon className={cn('mr-2 h-3 w-3', config.className.split(' ')[1])} />}
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Channel toggle */}
        <ToggleGroup
          type="single"
          value={currentChannel}
          onValueChange={(v) => v && handleChannelChange(v)}
          className="hidden md:flex"
        >
          <ToggleGroupItem value="all" aria-label="Todos os canais" className="text-xs px-3">
            <Globe className="h-3 w-3 mr-1" />
            Todos
          </ToggleGroupItem>
          <ToggleGroupItem value="email" aria-label="Email" className="text-xs px-3">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </ToggleGroupItem>
          <ToggleGroupItem value="internal" aria-label="Da base" className="text-xs px-3">
            <MessageSquare className="h-3 w-3 mr-1" />
            Base
          </ToggleGroupItem>
          <ToggleGroupItem value="whatsapp" aria-label="WhatsApp" className="text-xs px-3">
            <MessageCircle className="h-3 w-3 mr-1" />
            WhatsApp
          </ToggleGroupItem>
          <ToggleGroupItem value="public_link" aria-label="Link" className="text-xs px-3">
            <Link2 className="h-3 w-3 mr-1" />
            Link
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Date range */}
        <div className="hidden lg:flex gap-2">
          <Input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined, page: 1 })}
            className="w-36 text-xs"
            aria-label="Data inicial"
          />
          <Input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined, page: 1 })}
            className="w-36 text-xs"
            aria-label="Data final"
          />
        </div>
      </div>

      {/* Active filters chips + clear button */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status?.map(s => (
            <Badge key={s} variant="outline" className="gap-1 text-xs">
              {statusOptions.find(o => o.value === s)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleStatus(s)}
              />
            </Badge>
          ))}
          {filters.method && (
            <Badge variant="outline" className="gap-1 text-xs">
              Canal: {filters.method[0]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, method: undefined, page: 1 })}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="outline" className="gap-1 text-xs">
              {filters.dateFrom ?? '...'} — {filters.dateTo ?? '...'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onChange({ ...filters, dateFrom: undefined, dateTo: undefined, page: 1 })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs text-muted-foreground">
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * NotificationSendsFilters
 * Filter bar for the notification sends table.
 * Includes debounced search, category, priority, and status dropdowns.
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  NotificationSendsFilters as FiltersType,
  NotificationCategory,
  NotificationPriority,
  NotificationSendStatus,
  NotificationChannel,
} from '@/types/notificationSends';
import { channelLabels } from '@/types/notificationSends';

interface NotificationSendsFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function NotificationSendsFilters({
  filters,
  onFiltersChange,
}: NotificationSendsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === 'all' ? '' : (value as NotificationCategory),
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'all' ? '' : (value as NotificationPriority),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? '' : (value as NotificationSendStatus),
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por titulo ou destinatario..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category */}
      <Select
        value={filters.category || 'all'}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="informativo">Informativo</SelectItem>
          <SelectItem value="operacional">Operacional</SelectItem>
          <SelectItem value="alerta">Alerta</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select
        value={filters.priority || 'all'}
        onValueChange={handlePriorityChange}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="baixa">Baixa</SelectItem>
          <SelectItem value="media">Media</SelectItem>
          <SelectItem value="alta">Alta</SelectItem>
          <SelectItem value="urgente">Urgente</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={filters.status || 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="sent">Enviada</SelectItem>
          <SelectItem value="scheduled">Agendada</SelectItem>
          <SelectItem value="failed">Falha</SelectItem>
          <SelectItem value="cancelled">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      {/* Canal */}
      <Select
        value={filters.channel || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, channel: value === 'all' ? '' : value as NotificationChannel })}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Canal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {(Object.keys(channelLabels) as NotificationChannel[]).map((key) => (
            <SelectItem key={key} value={key}>{channelLabels[key]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

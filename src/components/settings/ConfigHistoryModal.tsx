/**
 * ConfigHistoryModal Component
 * PRD-045: Modal com histórico de alterações
 */

import { useState, useMemo } from 'react';
import { Search, Calendar, User, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { ConfigCategory, ConfigHistoryEntry } from '@/types/settings';

interface ConfigHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: ConfigHistoryEntry[];
  categories: ConfigCategory[];
}

export function ConfigHistoryModal({
  open,
  onOpenChange,
  history,
  categories,
}: ConfigHistoryModalProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Filtrar histórico
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Filtro por busca
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.fieldName.toLowerCase().includes(lowerSearch) ||
          entry.userName.toLowerCase().includes(lowerSearch) ||
          entry.categoryName.toLowerCase().includes(lowerSearch)
      );
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.categoryKey === categoryFilter);
    }

    // Filtro por período
    if (periodFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();

      switch (periodFilter) {
        case 'day':
          cutoff.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (entry) => new Date(entry.timestamp) >= cutoff
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return filtered;
  }, [history, search, categoryFilter, periodFilter]);

  // Formatar valor para exibição
  const formatValue = (value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? 'Ativado' : 'Desativado';
    }
    if (value === null || value === undefined || value === '') {
      return '(vazio)';
    }
    return String(value);
  };

  // Formatar data
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Historico de Alteracoes</DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo periodo</SelectItem>
              <SelectItem value="day">Ultimo dia</SelectItem>
              <SelectItem value="week">Ultima semana</SelectItem>
              <SelectItem value="month">Ultimo mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de histórico */}
        <ScrollArea className="h-[400px] pr-4">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma alteracao encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entry.categoryName}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{entry.userName}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {entry.categoryName} &gt; {entry.subcategoryName} &gt;{' '}
                    </span>
                    <span className="font-medium">{entry.fieldName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm bg-muted/50 rounded p-2">
                    <span className="text-red-600 dark:text-red-400 line-through">
                      {formatValue(entry.previousValue)}
                    </span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatValue(entry.newValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

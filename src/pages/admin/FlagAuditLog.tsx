/**
 * FlagAuditLog Page
 * PRD-062: Feature Flags "Switch" - Global Audit Log
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText, Search, Calendar, ChevronLeft, ChevronRight,
  PlusCircle, ToggleLeft, Skull, ShieldOff, Edit2, UserPlus, UserMinus,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { FlagAuditAction } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const ITEMS_PER_PAGE = 10;

const actionConfig: Record<FlagAuditAction, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  created: {
    label: 'Criada',
    icon: PlusCircle,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  updated: {
    label: 'Atualizada',
    icon: Edit2,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  toggled: {
    label: 'Alternada',
    icon: ToggleLeft,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  killed: {
    label: 'Kill Switch',
    icon: Skull,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  unkilled: {
    label: 'Reativada',
    icon: ShieldOff,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  override_added: {
    label: 'Override +',
    icon: UserPlus,
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  override_removed: {
    label: 'Override -',
    icon: UserMinus,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FlagAuditLog() {
  const { auditLogs } = useFeatureFlags();

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [flagKeyFilter, setFlagKeyFilter] = useState<string>('all');
  const [performerFilter, setPerformerFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [page, setPage] = useState(1);

  // Unique flag keys for filter dropdown
  const flagKeys = useMemo(() => {
    const keys = new Set(auditLogs.map((a) => a.flagKey));
    return Array.from(keys).sort();
  }, [auditLogs]);

  // Unique performers
  const performers = useMemo(() => {
    const names = new Set(auditLogs.map((a) => a.performedByName));
    return Array.from(names).sort();
  }, [auditLogs]);

  // Filtered & sorted
  const filteredLogs = useMemo(() => {
    let logs = [...auditLogs].sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );

    if (actionFilter !== 'all') {
      logs = logs.filter((l) => l.action === actionFilter);
    }

    if (flagKeyFilter !== 'all') {
      logs = logs.filter((l) => l.flagKey === flagKeyFilter);
    }

    if (performerFilter.trim()) {
      const search = performerFilter.toLowerCase();
      logs = logs.filter((l) => l.performedByName.toLowerCase().includes(search));
    }

    if (dateFromFilter) {
      const from = new Date(dateFromFilter);
      logs = logs.filter((l) => new Date(l.performedAt) >= from);
    }

    if (dateToFilter) {
      const to = new Date(dateToFilter);
      to.setHours(23, 59, 59, 999);
      logs = logs.filter((l) => new Date(l.performedAt) <= to);
    }

    return logs;
  }, [auditLogs, actionFilter, flagKeyFilter, performerFilter, dateFromFilter, dateToFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  const resetPage = () => setPage(1);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <ScrollText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Auditoria de Feature Flags</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Histórico completo de alterações em flags, overrides e kill switches.
              </p>
            </div>
          </div>
        </motion.div>

        <AdminTabNav />

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <Select
                  value={actionFilter}
                  onValueChange={(v) => { setActionFilter(v); resetPage(); }}
                >
                  <SelectTrigger className="w-full lg:w-[160px] h-9">
                    <SelectValue placeholder="Acao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas acoes</SelectItem>
                    {Object.entries(actionConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={flagKeyFilter}
                  onValueChange={(v) => { setFlagKeyFilter(v); resetPage(); }}
                >
                  <SelectTrigger className="w-full lg:w-[200px] h-9">
                    <SelectValue placeholder="Flag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas flags</SelectItem>
                    {flagKeys.map((key) => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por executor..."
                    value={performerFilter}
                    onChange={(e) => { setPerformerFilter(e.target.value); resetPage(); }}
                    className="pl-9 h-9"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => { setDateFromFilter(e.target.value); resetPage(); }}
                      className="pl-9 h-9 w-[160px]"
                      placeholder="De"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => { setDateToFilter(e.target.value); resetPage(); }}
                      className="pl-9 h-9 w-[160px]"
                      placeholder="Ate"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audit Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[170px]">Data</TableHead>
                      <TableHead className="w-[120px]">Acao</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead>Executor</TableHead>
                      <TableHead>Alteracao</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum registro de auditoria encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLogs.map((log) => {
                        const config = actionConfig[log.action];
                        const Icon = config.icon;

                        return (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(log.performedAt)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn('gap-1 text-[10px] font-medium', config.className)}
                              >
                                <Icon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className="text-sm font-medium">{log.flagName}</span>
                                <br />
                                <span className="text-xs text-muted-foreground font-mono">{log.flagKey}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.performedByName}
                            </TableCell>
                            <TableCell className="text-xs">
                              {log.oldValue && log.newValue ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-red-600 line-through">{log.oldValue}</span>
                                  <span className="text-muted-foreground">&rarr;</span>
                                  <span className="text-green-600">{log.newValue}</span>
                                </div>
                              ) : log.newValue ? (
                                <span className="text-green-600">{log.newValue}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">
                              {log.details || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a{' '}
                    {Math.min(page * ITEMS_PER_PAGE, filteredLogs.length)} de{' '}
                    {filteredLogs.length} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Admin Audit Logs Page
 * PRD-061: Logs de Auditoria do sistema RBAC
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText, Search, SlidersHorizontal, Calendar, User, Shield,
  ChevronLeft, ChevronRight, Download, X, Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { useUsers } from '@/hooks/useUsersQuery';
import { useAuditLogs } from '@/hooks/useRBACQuery';
import { formatRelativeDate, formatDateTimeBR } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { exportToCSV, getExportDateSuffix } from '@/lib/csvExport';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import type { AuditAction, PermissionAuditLog } from '@/types/rbac';

const ITEMS_PER_PAGE = 20;

const auditActionLabels: Record<string, string> = {
  role_assigned: 'Papel Atribuido',
  role_removed: 'Papel Removido',
  permission_granted: 'Permissao Concedida',
  permission_denied: 'Permissao Negada',
  permission_removed: 'Permissao Removida',
  group_created: 'Grupo Criado',
  group_updated: 'Grupo Atualizado',
  group_deleted: 'Grupo Excluido',
  group_member_added: 'Membro Adicionado',
  group_member_removed: 'Membro Removido',
  user_created: 'Usuario Criado',
  user_updated: 'Usuario Atualizado',
  user_status_changed: 'Status Alterado',
  user_deleted: 'Usuario Excluido',
  impersonation_started: 'Impersonacao Iniciada',
  impersonation_ended: 'Impersonacao Encerrada',
  login: 'Login',
  logout: 'Logout',
  password_changed: 'Senha Alterada',
  plan_changed: 'Plano Alterado',
};

const auditActionColors: Record<string, string> = {
  login: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  user_created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  user_updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  user_status_changed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  user_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  role_assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  role_removed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  permission_granted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  permission_denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  permission_removed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  plan_changed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  impersonation_started: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  impersonation_ended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  password_changed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  group_created: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_updated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_deleted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_member_added: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_member_removed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const actionOptions: { value: AuditAction; label: string }[] = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'user_created', label: 'Usuario Criado' },
  { value: 'user_updated', label: 'Usuario Atualizado' },
  { value: 'user_status_changed', label: 'Status Alterado' },
  { value: 'user_deleted', label: 'Usuario Excluido' },
  { value: 'role_assigned', label: 'Papel Atribuido' },
  { value: 'role_removed', label: 'Papel Removido' },
  { value: 'permission_granted', label: 'Permissao Concedida' },
  { value: 'permission_denied', label: 'Permissao Negada' },
  { value: 'group_created', label: 'Grupo Criado' },
  { value: 'group_updated', label: 'Grupo Atualizado' },
  { value: 'group_member_added', label: 'Membro Adicionado' },
  { value: 'group_member_removed', label: 'Membro Removido' },
  { value: 'impersonation_started', label: 'Impersonacao Iniciada' },
  { value: 'impersonation_ended', label: 'Impersonacao Encerrada' },
  { value: 'password_changed', label: 'Senha Alterada' },
  { value: 'plan_changed', label: 'Plano Alterado' },
];

export default function AdminAuditLogs() {
  const { toast } = useToast();

  // Fetch data via service layer
  const { data: usersResult, isLoading: isLoadingUsers } = useUsers();
  const { data: auditLogsData, isLoading: isLoadingLogs } = useAuditLogs();

  const allUsers = usersResult?.data ?? [];
  const allAuditLogs = auditLogsData ?? [];

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter, userFilter, dateFrom, dateTo]);

  // Sort by date desc
  const sortedLogs = useMemo(() => {
    return [...allAuditLogs].sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }, [allAuditLogs]);

  // Filter
  const filteredLogs = useMemo(() => {
    return sortedLogs.filter(log => {
      // Text search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchText = [
          log.details,
          log.performedByName,
          log.targetUserName,
          auditActionLabels[log.action],
        ].some(text => text?.toLowerCase().includes(q));
        if (!matchText) return false;
      }
      // Action filter
      if (actionFilter && log.action !== actionFilter) return false;
      // User filter
      if (userFilter && log.performedBy !== userFilter && log.targetUserId !== userFilter) return false;
      // Date range
      if (dateFrom && log.performedAt < dateFrom) return false;
      if (dateTo && log.performedAt > dateTo + 'T23:59:59Z') return false;
      return true;
    });
  }, [sortedLogs, debouncedSearch, actionFilter, userFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const activeFilterCount =
    (actionFilter ? 1 : 0) +
    (userFilter ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const clearFilters = () => {
    setActionFilter('');
    setUserFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Ajuste os filtros para incluir eventos na exportacao.',
        variant: 'destructive',
      });
      return;
    }

    exportToCSV(
      filteredLogs,
      [
        { key: 'performedAt', header: 'Data', accessor: (log) => log.performedAt ? formatDateTimeBR(log.performedAt) : '' },
        { key: 'action', header: 'Acao', accessor: (log) => auditActionLabels[log.action] || log.action },
        { key: 'performedByName', header: 'Realizado Por', accessor: (log) => log.performedByName || '' },
        { key: 'targetUserName', header: 'Alvo', accessor: (log) => {
          const parts: string[] = [];
          if (log.targetUserName) parts.push(log.targetUserName);
          if (log.oldValue && log.newValue) parts.push(`${log.oldValue} -> ${log.newValue}`);
          if (log.permissionCode) parts.push(log.permissionCode);
          return parts.join(' | ');
        }},
        { key: 'details', header: 'Detalhes', accessor: (log) => log.details || '' },
      ],
      `auditoria-recrutars-${getExportDateSuffix()}`
    );

    toast({
      title: 'Exportacao concluida',
      description: `${filteredLogs.length} evento${filteredLogs.length !== 1 ? 's' : ''} exportado${filteredLogs.length !== 1 ? 's' : ''} com sucesso.`,
    });
  };

  // Unique users from logs
  const logUsers = useMemo(() => {
    const userIds = new Set<string>();
    sortedLogs.forEach(log => {
      if (log.performedBy) userIds.add(log.performedBy);
      if (log.targetUserId) userIds.add(log.targetUserId);
    });
    return allUsers.filter(u => userIds.has(u.id));
  }, [sortedLogs, allUsers]);

  // KPI counts
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = sortedLogs.filter(l => l.performedAt?.startsWith(today) ?? false);
    const loginCount = sortedLogs.filter(l => l.action === 'login').length;
    const permChanges = sortedLogs.filter(l =>
      ['permission_granted', 'permission_denied', 'role_assigned', 'role_removed'].includes(l.action)
    ).length;
    return [
      { label: 'Total de Eventos', value: sortedLogs.length, icon: ScrollText },
      { label: 'Eventos Hoje', value: todayLogs.length, icon: Calendar },
      { label: 'Logins Registrados', value: loginCount, icon: User },
      { label: 'Alteracoes de Permissao', value: permChanges, icon: Shield },
    ];
  }, [sortedLogs]);

  if (isLoadingLogs || isLoadingUsers) {
    return (
      <DashboardLayout userType="admin">
        <AdminTabNav />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-foreground">Auditoria</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Registro de todas as ações realizadas no sistema. Rastreie operações de usuários, alterações e eventos.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </motion.div>

        <AdminTabNav />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <kpi.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos detalhes dos eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-xl p-4 shadow-soft border"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Filtros Avancados</span>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Tipo de Acao</Label>
                  <Select value={actionFilter} onValueChange={(v) => setActionFilter(v === '_all' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as acoes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">Todas as acoes</SelectItem>
                      {actionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Usuario</Label>
                  <Select value={userFilter} onValueChange={(v) => setUserFilter(v === '_all' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">Todos os usuarios</SelectItem>
                      {logUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">De</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Ate</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl shadow-soft overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Data</TableHead>
                <TableHead className="min-w-[140px]">Acao</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[140px]">Realizado por</TableHead>
                <TableHead className="hidden md:table-cell min-w-[140px]">Alvo</TableHead>
                <TableHead className="hidden lg:table-cell">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum evento encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
              {paginatedLogs.map((log) => {
                const colorClass = auditActionColors[log.action] || 'bg-gray-100 text-gray-800';
                const date = new Date(log.performedAt);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium">
                          {date.toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground sm:hidden block">
                        {formatRelativeDate(log.performedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs border-0', colorClass)}>
                        {auditActionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm">{log.performedByName}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        {log.targetUserName && (
                          <span className="text-sm">{log.targetUserName}</span>
                        )}
                        {log.oldValue && log.newValue && (
                          <div className="text-xs text-muted-foreground">
                            {log.oldValue} → {log.newValue}
                          </div>
                        )}
                        {log.permissionCode && (
                          <Badge variant="secondary" className="text-[10px] mt-0.5">
                            {log.permissionCode}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {log.details}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              {filteredLogs.length === 0
                ? '0 eventos'
                : `${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filteredLogs.length)} de ${filteredLogs.length} eventos`
              }
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

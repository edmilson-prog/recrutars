/**
 * Admin Users Page
 * PRD-061: Gestao de Usuarios e Permissoes (RBAC)
 * Listagem unificada de usuarios com filtros, busca e acoes em lote.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, Building2, UserCheck, UserX, Search,
  SlidersHorizontal, CheckCircle, Ban, ChevronLeft, ChevronRight,
  Download, Crown, Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsers, useUpdateUserStatus } from '@/hooks/useUsersQuery';
import { useRoles } from '@/hooks/useRBACQuery';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { UserFilters, type UserFiltersState } from '@/components/admin/users/UserFilters';
import { UserTable } from '@/components/admin/users/UserTable';
import type { User } from '@/types';
import type { UserStatus } from '@/types/rbac';

const ITEMS_PER_PAGE = 50;

const emptyFilters: UserFiltersState = {
  types: [],
  statuses: [],
  roleId: '',
  plan: '',
  dateFrom: '',
  dateTo: '',
};

export default function AdminUsers() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<UserFiltersState>(emptyFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Fetch users via service layer
  const { data: usersResult, isLoading: isLoadingUsers } = useUsers();
  const { data: rolesData } = useRoles();
  const updateStatusMutation = useUpdateUserStatus();

  // Users with RBAC enrichment from service
  const [localUsers, setLocalUsers] = useState<User[]>([]);

  // Sync service data to local state (for local mutations like status changes)
  useEffect(() => {
    if (usersResult?.data) {
      setLocalUsers(usersResult.data);
    }
  }, [usersResult]);

  const users = localUsers;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [debouncedSearch, filters]);

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!user.name.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Type
      if (filters.types.length > 0 && !filters.types.includes(user.type)) return false;
      // Status
      if (filters.statuses.length > 0) {
        const status = user.status || 'active';
        if (!filters.statuses.includes(status as UserStatus)) return false;
      }
      // Role
      if (filters.roleId && user.roleId !== filters.roleId) return false;
      // Date range
      if (filters.dateFrom && user.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && user.createdAt > filters.dateTo) return false;
      return true;
    });
  }, [users, debouncedSearch, filters]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // KPI counts
  const kpis = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.type === 'admin').length;
    const companies = users.filter(u => u.type === 'company').length;
    const candidates = users.filter(u => u.type === 'candidate').length;
    const active = users.filter(u => (u.status || 'active') === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive' || u.status === 'suspended' || u.status === 'pending').length;
    return [
      { label: 'Total Usuarios', value: total, icon: Users, color: 'bg-primary/10 text-primary' },
      { label: 'Admins', value: admins, icon: ShieldCheck, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
      { label: 'Empresas', value: companies, icon: Building2, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      { label: 'Candidatos', value: candidates, icon: Crown, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      { label: 'Ativos', value: active, icon: UserCheck, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      { label: 'Inativos', value: inactive, icon: UserX, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    ];
  }, [users]);

  // Selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map(u => u.id));
    }
  }, [selectedIds.length, paginatedUsers]);

  // Status change
  const handleStatusChange = useCallback((userId: string, status: 'active' | 'inactive' | 'suspended') => {
    setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    updateStatusMutation.mutate({ id: userId, status });
  }, [updateStatusMutation]);

  // Bulk actions
  const bulkActivate = () => {
    setLocalUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status: 'active' as UserStatus } : u));
    selectedIds.forEach(id => updateStatusMutation.mutate({ id, status: 'active' }));
    setSelectedIds([]);
  };

  const bulkDeactivate = () => {
    setLocalUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status: 'inactive' as UserStatus } : u));
    selectedIds.forEach(id => updateStatusMutation.mutate({ id, status: 'inactive' }));
    setSelectedIds([]);
  };

  if (isLoadingUsers) {
    return (
      <DashboardLayout userType="admin">
        <AdminTabNav />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const filtersContent = (
    <UserFilters
      filters={filters}
      onChange={setFilters}
      onClear={() => setFilters(emptyFilters)}
    />
  );

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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencie todos os usuários da plataforma. Visualize perfis, status e tipos de conta.
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </motion.div>

        <AdminTabNav />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search + Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile: Filter Sheet */}
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                  {(filters.types.length + filters.statuses.length + (filters.roleId ? 1 : 0)) > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                      {filters.types.length + filters.statuses.length + (filters.roleId ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>Refine a listagem de usuarios</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  {filtersContent}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {/* Sidebar toggle could go here */}}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <span className="text-sm font-medium">
              {selectedIds.length} usuario{selectedIds.length > 1 ? 's' : ''} selecionado{selectedIds.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={bulkActivate}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Ativar
              </Button>
              <Button size="sm" variant="outline" onClick={bulkDeactivate}>
                <Ban className="w-4 h-4 mr-1" />
                Desativar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 shrink-0"
            >
              <div className="bg-card rounded-xl p-5 shadow-soft sticky top-4">
                {filtersContent}
              </div>
            </motion.div>
          )}

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              <UserTable
                users={paginatedUsers}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
                onStatusChange={handleStatusChange}
              />

              {/* Pagination */}
              {filteredUsers.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-sm text-muted-foreground">
                    Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length}
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
              )}

              {/* Results count footer */}
              {filteredUsers.length <= ITEMS_PER_PAGE && (
                <div className="px-4 py-3 border-t">
                  <span className="text-sm text-muted-foreground">
                    {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

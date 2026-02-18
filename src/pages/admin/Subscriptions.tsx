/**
 * Subscriptions Page
 * PRD-060: Subscriptions listing and management
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Users,
  CreditCard,
  XCircle,
  Star,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pause,
  ShoppingBag,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { Sheet } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionDetail } from '@/components/admin/plans/SubscriptionDetail';
import { OneTimePurchaseManager } from '@/components/admin/plans/OneTimePurchaseManager';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import { toast } from 'sonner';
import type { Subscription, SubscriptionStatus } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: 'Ativa', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  trial: { label: 'Trial', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400', icon: Clock },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  expired: { label: 'Expirada', color: 'bg-muted text-muted-foreground', icon: Clock },
  suspended: { label: 'Suspensa', color: 'bg-warning/10 text-warning', icon: Pause },
  pending: { label: 'Pendente', color: 'bg-blue-100 text-blue-600 dark:bg-blue-950', icon: AlertTriangle },
};

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export default function SubscriptionsPage() {
  const {
    stats,
    filterSubscriptions,
    getHistoryForSubscription,
    cancelSubscription,
    reactivateSubscription,
    purchases,
  } = useSubscriptions();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Sheet state
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return filterSubscriptions({
      status: statusFilter !== 'all' ? (statusFilter as SubscriptionStatus) : undefined,
      userType: userTypeFilter !== 'all' ? (userTypeFilter as 'candidate' | 'company') : undefined,
      search: debouncedSearch || undefined,
    }).filter((s) => planFilter === 'all' || s.planSlug === planFilter);
  }, [filterSubscriptions, statusFilter, userTypeFilter, debouncedSearch, planFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE));
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, userTypeFilter, planFilter]);

  const handleRowClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setSheetOpen(true);
  };

  const handleCancel = (id: string, reason: string) => {
    cancelSubscription(id, reason);
    toast.success('Assinatura cancelada.');
    setSheetOpen(false);
    setSelectedSubscription(null);
  };

  const handleReactivate = (id: string) => {
    reactivateSubscription(id);
    toast.success('Assinatura reativada.');
    setSheetOpen(false);
    setSelectedSubscription(null);
  };

  const subscriptionHistory = selectedSubscription
    ? getHistoryForSubscription(selectedSubscription.id)
    : [];

  // KPI cards data
  const kpis = [
    { label: 'Total', value: stats.total, icon: Users, color: 'text-foreground' },
    { label: 'Ativas', value: stats.active, icon: CheckCircle2, color: 'text-success' },
    { label: 'Canceladas', value: stats.cancelled, icon: XCircle, color: 'text-destructive' },
    { label: 'Early Adopters', value: stats.earlyAdopters, icon: Star, color: 'text-cyan-600' },
    { label: 'Receita Mensal', value: formatBRL(stats.totalRevenue), icon: DollarSign, color: 'text-success' },
  ];

  // Unique plan slugs for filter
  const planSlugs = useMemo(() => {
    const slugMap = new Map<string, string>();
    filteredSubscriptions.forEach((s) => {
      if (s.planSlug) slugMap.set(s.planSlug, s.planName);
    });
    // Also include all from unfiltered stats
    Object.keys(stats.byPlan).forEach((name) => {
      if (!name) return;
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      slugMap.set(slug, name);
    });
    return Array.from(slugMap.entries());
  }, [filteredSubscriptions, stats.byPlan]);

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
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencie todas as assinaturas da plataforma. Visualize status, planos ativos e histórico de pagamentos.
              </p>
            </div>
          </div>
        </motion.div>

        <AdminTabNav />

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs: Subscriptions / One-time purchases */}
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="subscriptions">
              <CreditCard className="w-4 h-4 mr-2" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Compras Avulsas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  className="pl-9 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="candidate">Candidato</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="suspended">Suspensas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  {planSlugs.map(([slug, name]) => (
                    <SelectItem key={slug} value={slug}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              {filteredSubscriptions.length} assinatura{filteredSubscriptions.length !== 1 ? 's' : ''} encontrada{filteredSubscriptions.length !== 1 ? 's' : ''}
            </p>

            {/* Table */}
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Preco</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Early Adopter</TableHead>
                      <TableHead>Renovacao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscriptions.map((sub) => {
                      const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow
                          key={sub.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(sub)}
                        >
                          <TableCell className="font-medium text-foreground">
                            {sub.userName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                sub.userType === 'candidate'
                                  ? 'border-cyan-500/30 text-cyan-600'
                                  : 'border-blue-500/30 text-blue-600'
                              )}
                            >
                              {sub.userType === 'candidate' ? 'Candidato' : 'Empresa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{sub.planName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {PERIOD_LABELS[sub.period] || sub.period}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatBRL(sub.pricePaid)}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1 text-xs', statusInfo.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sub.isEarlyAdopter ? (
                              <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400 text-xs gap-1">
                                <Star className="w-3 h-3" />
                                Sim
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">--</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {sub.renewalDate ? formatDateBR(sub.renewalDate) : '--'}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {paginatedSubscriptions.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhuma assinatura encontrada com os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <OneTimePurchaseManager purchases={purchases} />
          </TabsContent>
        </Tabs>

        {/* Subscription Detail Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SubscriptionDetail
            subscription={selectedSubscription}
            history={subscriptionHistory}
            onCancel={handleCancel}
            onReactivate={handleReactivate}
            onClose={() => setSheetOpen(false)}
          />
        </Sheet>
      </div>
    </DashboardLayout>
  );
}

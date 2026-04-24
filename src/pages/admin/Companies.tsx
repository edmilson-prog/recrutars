/**
 * Companies Page - Company Management (Admin)
 * PRD-020: Gestão de Empresas
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaginationParams } from '@/hooks/usePaginationParams';
import { useAdminCompanyFilters } from '@/hooks/useAdminCompanyFilters';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Building2,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Power,
  PowerOff,
  Bell,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// TODO: Replace with audit log service/API when available
const initialAdminActions: AdminAction[] = [
  {
    id: 'action-1',
    companyId: 'company-1',
    companyName: 'Tech Solutions',
    action: 'plan_changed',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-12-15T10:30:00',
    details: 'Plano alterado de Essencial Empresas para Seleção Inteligente',
    previousValue: 'Essencial Empresas',
    newValue: 'Seleção Inteligente',
  },
  {
    id: 'action-2',
    companyId: 'company-7',
    companyName: 'VelhaCorp Ltda',
    action: 'deactivated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-11-30T14:00:00',
    details: 'Empresa desativada por inadimplência',
  },
  {
    id: 'action-3',
    companyId: 'company-10',
    companyName: 'TurismoVip',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2026-01-05T09:00:00',
    details: 'Notificação enviada: lembrete de pagamento pendente',
  },
  {
    id: 'action-4',
    companyId: 'company-4',
    companyName: 'Saúde em Foco',
    action: 'plan_changed',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-10-10T11:15:00',
    details: 'Plano alterado de Seleção Inteligente para Recrutamento Premium',
    previousValue: 'Seleção Inteligente',
    newValue: 'Recrutamento Premium',
  },
  {
    id: 'action-5',
    companyId: 'company-33',
    companyName: 'StartupHub Incubadora',
    action: 'deactivated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-12-20T16:30:00',
    details: 'Empresa desativada a pedido do proprietário',
  },
  {
    id: 'action-6',
    companyId: 'company-15',
    companyName: 'MobiLink',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-12-28T10:00:00',
    details: 'Notificação enviada: confirmar cadastro e realizar primeiro pagamento',
  },
  {
    id: 'action-7',
    companyId: 'company-6',
    companyName: 'LogíFast',
    action: 'plan_changed',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-08-20T14:45:00',
    details: 'Plano alterado de Seleção Inteligente para Recrutamento Premium',
    previousValue: 'Seleção Inteligente',
    newValue: 'Recrutamento Premium',
  },
  {
    id: 'action-8',
    companyId: 'company-2',
    companyName: 'Inovação Digital',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-11-12T09:30:00',
    details: 'Notificação enviada: oportunidade de upgrade para plano Seleção Inteligente',
  },
  {
    id: 'action-9',
    companyId: 'company-28',
    companyName: 'Banco Digital Neo',
    action: 'activated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2022-10-05T10:00:00',
    details: 'Empresa ativada após aprovação do cadastro',
  },
  {
    id: 'action-10',
    companyId: 'company-18',
    companyName: 'DataScience Pro',
    action: 'plan_changed',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-09-15T15:00:00',
    details: 'Plano alterado de Seleção Inteligente para Recrutamento Premium por necessidade de mais vagas',
    previousValue: 'Seleção Inteligente',
    newValue: 'Recrutamento Premium',
  },
  {
    id: 'action-11',
    companyId: 'company-31',
    companyName: 'Revista InfoMundo',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2026-01-10T11:00:00',
    details: 'Notificação enviada: lembrete de pagamento pendente - prazo final',
  },
  {
    id: 'action-12',
    companyId: 'company-25',
    companyName: 'CloudServe',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-07-20T10:30:00',
    details: 'Notificação enviada: parabéns por atingir 200 candidatos no banco de talentos',
  },
  {
    id: 'action-13',
    companyId: 'company-3',
    companyName: 'StartUp Brasil',
    action: 'notification_sent',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2026-01-12T09:00:00',
    details: 'Notificação enviada: confirmação de pagamento pendente',
  },
  {
    id: 'action-14',
    companyId: 'company-14',
    companyName: 'SuperMercado Bom Preço',
    action: 'plan_changed',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2025-06-10T13:30:00',
    details: 'Plano alterado de Seleção Inteligente para Recrutamento Premium devido ao crescimento',
    previousValue: 'Seleção Inteligente',
    newValue: 'Recrutamento Premium',
  },
  {
    id: 'action-15',
    companyId: 'company-9',
    companyName: 'Construtora XYZ',
    action: 'activated',
    performedBy: 'Ana Silva (Admin)',
    performedAt: '2022-03-22T10:15:00',
    details: 'Empresa ativada com plano Recrutamento Premium',
  },
];
import { useCompanies } from '@/hooks/useCompaniesQuery';
import { useJobs } from '@/hooks/useJobsQuery';
import type { Company, CompanyStatus, AdminAction, Job } from '@/types';
import { usePlans } from '@/hooks/usePlans';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

// Constantes
const ITEMS_PER_PAGE = 20;

const STATUS_CONFIG = {
  active: {
    label: 'Ativa',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  inactive: {
    label: 'Inativa',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

// PLANS removido — dados agora vem dinamicamente via usePlans()
const INDUSTRIES = [
  'Tecnologia',
  'Saúde',
  'Educação',
  'Varejo',
  'Logística',
  'Marketing Digital',
  'Fintech',
  'Construção',
  'Consultoria',
  'Alimentação',
  'Turismo',
  'Pet Shop',
  'Energia',
  'Agronegócio',
  'Imobiliário',
  'Arquitetura',
  'Jurídico',
  'Mídia',
  'Indústria',
];

export default function AdminCompanies() {
  const navigate = useNavigate();

  // Fetch companies via service layer
  const { data: companiesResult, isLoading: isLoadingCompanies } = useCompanies();
  const { data: jobsResult } = useJobs();
  const allJobs = jobsResult?.data ?? [];

  // Filters synced with URL search params (survive navigation to company detail)
  const {
    searchTerm,
    statusFilter,
    planFilter,
    industryFilter,
    setSearchTerm,
    setStatusFilter,
    setPlanFilter,
    setIndustryFilter,
    clearFilters,
    hasActiveFilters,
  } = useAdminCompanyFilters();

  // Search input: local state for responsive typing, debounced sync to URL
  const [searchInput, setSearchInput] = useState(searchTerm);
  const debouncedSearch = useDebounce(searchInput, 300);

  const lastUrlSearchRef = useRef(searchTerm);
  useEffect(() => {
    if (searchTerm !== lastUrlSearchRef.current) {
      lastUrlSearchRef.current = searchTerm;
      setSearchInput(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      lastUrlSearchRef.current = debouncedSearch;
      setSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm, setSearchTerm]);

  // Pagination (synced with URL search params)
  const { page: currentPage, setPage: setCurrentPage } = usePaginationParams({ defaultPage: 1 });

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Action modals
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  // Form state
  const [deactivateReason, setDeactivateReason] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Planos dinamicos para Select
  const { companyPlans } = usePlans();
  const PLANS = [...new Set(companyPlans.map(p => p.name))];

  // Local state for companies (to allow status/plan changes)
  const [companies, setCompanies] = useState<Company[]>([]);

  // Local state for admin actions
  const [actions, setActions] = useState<AdminAction[]>(initialAdminActions);

  // Sync service data to local state
  useEffect(() => {
    if (companiesResult?.data) {
      setCompanies(companiesResult.data);
    }
  }, [companiesResult]);

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const searchLower = debouncedSearch.toLowerCase();
    const matchesSearch =
      company.name.toLowerCase().includes(searchLower) ||
      company.cnpj.includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' || company.status === statusFilter;

    const matchesPlan = planFilter === 'all' || company.plan === planFilter;

    const matchesIndustry =
      industryFilter === 'all' || company.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesPlan && matchesIndustry;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filter changes reset page automatically via useAdminCompanyFilters

  const handleCardClick = (company: Company) => {
    navigate(`/admin/empresas/${company.id}`);
  };

  // ACTIONS: Deactivate, Reactivate, Change Plan, Notify

  const handleDeactivate = () => {
    if (!selectedCompany) return;

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id
          ? { ...c, status: 'inactive' as CompanyStatus, deactivatedAt: new Date().toISOString() }
          : c
      )
    );

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      action: 'deactivated',
      performedBy: 'Você',
      performedAt: new Date().toISOString(),
      details: deactivateReason || 'Empresa desativada',
    };
    setActions((prev) => [newAction, ...prev]);

    toast.success(`Empresa ${selectedCompany.name} desativada`);
    setDeactivateDialogOpen(false);
    setDeactivateReason('');
    setDrawerOpen(false);
    setSelectedCompany(null);
  };

  const handleReactivate = () => {
    if (!selectedCompany) return;

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id
          ? { ...c, status: 'active' as CompanyStatus, deactivatedAt: undefined }
          : c
      )
    );

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      action: 'activated',
      performedBy: 'Você',
      performedAt: new Date().toISOString(),
      details: 'Empresa reativada',
    };
    setActions((prev) => [newAction, ...prev]);

    toast.success(`Empresa ${selectedCompany.name} reativada`);
    setReactivateDialogOpen(false);
    setDrawerOpen(false);
    setSelectedCompany(null);
  };

  const handleChangePlan = () => {
    if (!selectedCompany || newPlan === selectedCompany.plan) return;

    const oldPlan = selectedCompany.plan;

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id ? { ...c, plan: newPlan } : c
      )
    );

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      action: 'plan_changed',
      performedBy: 'Você',
      performedAt: new Date().toISOString(),
      details: `Plano alterado de ${oldPlan} para ${newPlan}`,
      previousValue: oldPlan,
      newValue: newPlan,
    };
    setActions((prev) => [newAction, ...prev]);

    toast.success(`Plano alterado para ${newPlan}`);
    setChangePlanModalOpen(false);
    setNewPlan('Essencial Empresas');
  };

  const handleSendNotification = () => {
    if (!selectedCompany || !notificationMessage.trim()) return;

    const newAction: AdminAction = {
      id: `action-${Date.now()}`,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      action: 'notification_sent',
      performedBy: 'Você',
      performedAt: new Date().toISOString(),
      details: `Notificação enviada: ${notificationMessage.substring(0, 50)}${notificationMessage.length > 50 ? '...' : ''}`,
    };
    setActions((prev) => [newAction, ...prev]);

    toast.success(`Notificação enviada para ${selectedCompany.name}`);
    setNotifyModalOpen(false);
    setNotificationMessage('');
  };

  // Get data for selected company
  const companyJobs = selectedCompany
    ? allJobs.filter((job) => job.companyId === selectedCompany.id)
    : [];

  const companyActions = selectedCompany
    ? actions
        .filter((a) => a.companyId === selectedCompany.id)
        .sort(
          (a, b) =>
            new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
        )
    : [];

  // Filter content component (reused in sidebar and sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Status */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="inactive">Inativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plan */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Plano</label>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            {PLANS.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Industry */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Setor</label>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os setores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </div>
  );

  // Pagination helper
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (isLoadingCompanies) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Empresas"
          description="Visualize e gerencie todas as empresas cadastradas na plataforma. Acompanhe status, planos, vagas publicadas e execute ações administrativas."
          badges={
            companies.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  {companies.length} {companies.length === 1 ? 'empresa' : 'empresas'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {companies.filter(c => c.status === 'active').length} ativas
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="w-3 h-3" />
                  {companies.filter(c => c.status === 'pending').length} pendentes
                </span>
              </>
            ) : undefined
          }
          howItWorks={[
            'Visualize todas as empresas cadastradas na plataforma',
            'Filtre por status, plano e nível de atividade',
            'Use as ações do menu para gerenciar cada empresa',
          ]}
        />

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              className="pl-10 pr-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchInput('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
                {hasActiveFilters && <Badge className="ml-2 bg-secondary">!</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription className="sr-only">Filtrar empresas por status, plano e setor</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Companies List */}
          <div className="flex-1 space-y-4">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredCompanies.length} empresa
                {filteredCompanies.length !== 1 ? 's' : ''} encontrada
                {filteredCompanies.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Company Cards */}
            {paginatedCompanies.map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => handleCardClick(company)}
                index={index}
              />
            ))}

            {/* Empty State */}
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma empresa encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros de busca
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <span className="px-3 text-muted-foreground">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Details Drawer */}
      <CompanyDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        company={selectedCompany}
        jobs={companyJobs}
        actions={companyActions}
        onDeactivate={() => setDeactivateDialogOpen(true)}
        onReactivate={() => setReactivateDialogOpen(true)}
        onChangePlan={() => {
          setNewPlan(selectedCompany?.plan || 'Essencial Empresas');
          setChangePlanModalOpen(true);
        }}
        onNotify={() => setNotifyModalOpen(true)}
      />

      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja desativar {selectedCompany?.name}?
              Esta ação pausará todas as vagas ativas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo da desativação (opcional)"
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja reativar {selectedCompany?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate}>
              Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Modal */}
      <Dialog open={changePlanModalOpen} onOpenChange={setChangePlanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Empresa: {selectedCompany?.name} | Plano atual:{' '}
              {selectedCompany?.plan}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPlan">Novo plano</Label>
              <Select value={newPlan} onValueChange={(v) => setNewPlan(v)}>
                <SelectTrigger id="newPlan">
                  <SelectValue placeholder="Selecione o novo plano" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan}>
              <CreditCard className="w-4 h-4 mr-2" />
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      <Dialog open={notifyModalOpen} onOpenChange={setNotifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificação</DialogTitle>
            <DialogDescription>
              Enviar notificação para: {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notificationMessage">Mensagem</Label>
              <Textarea
                id="notificationMessage"
                placeholder="Escreva a mensagem da notificação..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                maxLength={500}
                className="resize-none"
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notificationMessage.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification} disabled={!notificationMessage.trim()}>
              <Bell className="w-4 h-4 mr-2" />
              Enviar Notificação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Company Card Component
interface CompanyCardProps {
  company: Company;
  onClick: () => void;
  index?: number;
}

function CompanyCard({ company, onClick, index = 0 }: CompanyCardProps) {
  const statusConfig = STATUS_CONFIG[company.status];
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Building2 className="w-8 h-8 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 flex-wrap">
                {company.name}
                <Badge
                  variant="secondary"
                  className={cn(statusConfig.bgColor, statusConfig.color)}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                CNPJ: {company.cnpj}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{company.plan}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {company.activeJobs} vaga{company.activeJobs !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {company.totalCandidates} candidato{company.totalCandidates !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(company.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {company.location}
            </span>
            <span>{company.industry}</span>
            <span>{company.size}</span>
          </div>

          {/* Alerts */}
          {company.paymentStatus === 'pending' && (
            <div className="mt-3">
              <Badge variant="outline" className="text-warning border-warning/30">
                <Clock className="w-3 h-3 mr-1" />
                Pagamento pendente
              </Badge>
            </div>
          )}
          {company.paymentStatus === 'overdue' && (
            <div className="mt-3">
              <Badge variant="outline" className="text-destructive border-destructive/30">
                <XCircle className="w-3 h-3 mr-1" />
                Pagamento atrasado
              </Badge>
            </div>
          )}
        </div>

        {/* Actions Hint */}
        <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
      </div>
    </motion.div>
  );
}

// Company Drawer Component
interface CompanyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  jobs: Job[];
  actions: AdminAction[];
  onDeactivate: () => void;
  onReactivate: () => void;
  onChangePlan: () => void;
  onNotify: () => void;
}

function CompanyDrawer({
  open,
  onOpenChange,
  company,
  jobs,
  actions,
  onDeactivate,
  onReactivate,
  onChangePlan,
  onNotify,
}: CompanyDrawerProps) {
  if (!company) return null;

  const statusConfig = STATUS_CONFIG[company.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {/* Header */}
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{company.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                CNPJ: {company.cnpj}
              </p>
              <p className="text-sm text-muted-foreground">
                {company.industry} | {company.size}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(statusConfig.bgColor, statusConfig.color)}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <SheetDescription className="sr-only">Detalhes da empresa {company.name}</SheetDescription>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="jobs">Vagas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            {/* Tab: Informações */}
            <TabsContent value="info" className="space-y-6 mt-0">
              {/* Plano Atual */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Plano Atual
                </h4>
                <div className="space-y-2">
                  <p className="text-lg font-medium">{company.plan}</p>
                  {company.paymentStatus === 'ok' && (
                    <Badge variant="outline" className="text-success border-success/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Em dia
                    </Badge>
                  )}
                  {company.paymentStatus === 'pending' && (
                    <Badge variant="outline" className="text-warning border-warning/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Pagamento pendente
                    </Badge>
                  )}
                  {company.paymentStatus === 'overdue' && (
                    <Badge variant="outline" className="text-destructive border-destructive/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      Pagamento atrasado
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onChangePlan}
                >
                  Alterar plano
                </Button>
              </div>

              {/* Contato */}
              <div className="space-y-3">
                <h4 className="font-semibold">Contato</h4>
                {company.phone && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Telefone:</span>{' '}
                    {company.phone}
                  </p>
                )}
                {company.website && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Website:</span>{' '}
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      {company.website}
                    </a>
                  </p>
                )}
                {company.linkedin && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">LinkedIn:</span>{' '}
                    <a
                      href={company.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      {company.linkedin}
                    </a>
                  </p>
                )}
                {company.address && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Endereço:</span>{' '}
                    {company.address}
                  </p>
                )}
              </div>

              {/* Métricas */}
              <div className="space-y-3">
                <h4 className="font-semibold">Métricas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-foreground">
                      {company.activeJobs}
                    </p>
                    <p className="text-xs text-muted-foreground">Vagas ativas</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-foreground">
                      {company.totalCandidates}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total candidaturas
                    </p>
                  </div>
                </div>
              </div>

              {/* Ações Administrativas */}
              <div className="space-y-3">
                <h4 className="font-semibold">Ações Administrativas</h4>
                <div className="flex flex-wrap gap-2">
                  {company.status === 'active' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onDeactivate}
                    >
                      <PowerOff className="w-4 h-4 mr-2" />
                      Desativar empresa
                    </Button>
                  )}
                  {company.status === 'inactive' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onReactivate}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Reativar empresa
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={onNotify}>
                    <Bell className="w-4 h-4 mr-2" />
                    Enviar notificação
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Vagas */}
            <TabsContent value="jobs" className="space-y-3 mt-0">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-muted/50 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{job.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {job.level} | {job.location}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {job.status === 'active' ? 'Ativa' : 'Pausada'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.applicationsCount} candidatura
                      {job.applicationsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma vaga cadastrada
                </p>
              )}
            </TabsContent>

            {/* Tab: Usuários (Mock) */}
            <TabsContent value="users" className="space-y-3 mt-0">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. No futuro, aqui será
                  exibida a lista de usuários da empresa.
                </p>
              </div>
            </TabsContent>

            {/* Tab: Histórico */}
            <TabsContent value="history" className="space-y-3 mt-0">
              {actions.length > 0 ? (
                <div className="space-y-3">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 text-sm border-l-2 border-primary pl-4"
                    >
                      <div>
                        <p className="font-medium">{action.details}</p>
                        <p className="text-muted-foreground text-xs">
                          {action.performedBy} •{' '}
                          {new Date(action.performedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma ação registrada
                </p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/**
 * JobsList Page
 * PRD-058: Listagem de todas as vagas com filtros avançados
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePaginationParams } from '@/hooks/usePaginationParams';
import {
  Search,
  Star,
  MoreHorizontal,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { JobFilters } from '@/components/admin/jobs/JobFilters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const PAGE_SIZE = 20;

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativa', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
  rejected: { label: 'Rejeitada', className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  correction: { label: 'Correção', className: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
  finalized: { label: 'Finalizada', className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400' },
};

const MODERATION_BADGES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
  approved: { label: 'Aprovada', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  rejected: { label: 'Rejeitada', className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  correction_requested: { label: 'Correção', className: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
};

export default function JobsList() {
  const navigate = useNavigate();
  const { jobs, filterJobs, toggleHighlight } = useAdminJobs();
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const { page, setPage, resetPage } = usePaginationParams({ defaultPage: 1, zeroIndexed: true });

  // Unique values for filter options
  const companies = useMemo(() => [...new Set(jobs.map((j) => j.companyName))].sort(), [jobs]);
  const areas = useMemo(() => [...new Set(jobs.map((j) => j.area))].sort(), [jobs]);
  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location))].sort(), [jobs]);

  // Apply filters
  const filtered = useMemo(() => {
    const clean: Record<string, string | boolean | undefined> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '' && value !== '__all__') {
        clean[key] = value as string | boolean | undefined;
      }
    }
    return filterJobs(clean);
  }, [filters, filterJobs]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    resetPage();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const FilterSidebar = (
    <JobFilters
      filters={filters as Record<string, string | boolean | undefined>}
      onFilterChange={handleFilterChange}
      companies={companies}
      areas={areas}
      locations={locations}
    />
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Todas as Vagas"
          description={<>Navegue e filtre todas as vagas publicadas na plataforma. {filtered.length} vagas encontradas.</>}
          actions={
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden shrink-0">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{FilterSidebar}</div>
              </SheetContent>
            </Sheet>
          }
          howItWorks={[
            'Lista completa de todas as vagas da plataforma',
            'Filtre por empresa, status, tipo de contrato e localização',
            'Use as ações do menu para moderar e gerenciar vagas',
          ]}
        />

        <AdminTabNav />

        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="bg-card rounded-2xl p-4 shadow-soft sticky top-4">
              {FilterSidebar}
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou empresa..."
                  value={(filters.search as string) || ''}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, search: e.target.value || undefined })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaga</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="hidden md:table-cell">Localidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Moderação</TableHead>
                      <TableHead className="hidden xl:table-cell">Plano</TableHead>
                      <TableHead className="hidden md:table-cell text-center">Dest.</TableHead>
                      <TableHead className="hidden lg:table-cell">Publicação</TableHead>
                      <TableHead className="text-center">Cand.</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                          Nenhuma vaga encontrada com os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((job) => {
                        const statusBadge = STATUS_BADGES[job.status] || STATUS_BADGES.active;
                        const modBadge = MODERATION_BADGES[job.moderationStatus] || MODERATION_BADGES.pending;
                        return (
                          <TableRow
                            key={job.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/admin/vagas/${job.id}`)}
                          >
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {job.title}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={job.companyLogo} />
                                  <AvatarFallback className="text-[10px]">
                                    {job.companyName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate max-w-[100px]">{job.companyName}</span>
                                {job.isAnonymous && (
                                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" title="Empresa confidencial para candidatos" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {job.location}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn('text-[10px]', statusBadge.className)}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="secondary" className={cn('text-[10px]', modBadge.className)}>
                                {modBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <Badge variant="outline" className="text-[10px]">
                                {job.companyPlan}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleHighlight(job.id);
                                }}
                                className="inline-flex"
                              >
                                <Star
                                  className={cn(
                                    'w-4 h-4',
                                    job.isHighlighted
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-muted-foreground'
                                  )}
                                />
                              </button>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {formatDate(job.publishedAt)}
                            </TableCell>
                            <TableCell className="text-center text-sm font-medium">
                              {job.applicationsCount}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/admin/vagas/${job.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleHighlight(job.id)}>
                                    <Star className="w-4 h-4 mr-2" />
                                    {job.isHighlighted ? 'Remover destaque' : 'Destacar'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                  <span className="text-xs text-muted-foreground">
                    Página {page + 1} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

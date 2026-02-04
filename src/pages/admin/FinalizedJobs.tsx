/**
 * FinalizedJobs Page
 * PRD-058: Listagem de vagas finalizadas com filtros por motivo
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Archive,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FinalizationReason } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const REASON_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  filled: {
    label: 'Preenchida',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  },
  expired: {
    label: 'Expirada',
    icon: Clock,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  },
};

export default function FinalizedJobs() {
  const { finalizedJobs, hires } = useAdminJobs();
  const [reasonFilter, setReasonFilter] = useState<string>('');

  const filtered = useMemo(() => {
    if (!reasonFilter || reasonFilter === '__all__') return finalizedJobs;
    return finalizedJobs.filter((j) => j.finalizationReason === reasonFilter);
  }, [finalizedJobs, reasonFilter]);

  // Stats
  const totalFinalized = finalizedJobs.length;
  const totalFilled = finalizedJobs.filter((j) => j.finalizationReason === 'filled').length;
  const totalCancelled = finalizedJobs.filter((j) => j.finalizationReason === 'cancelled').length;
  const totalExpired = finalizedJobs.filter((j) => j.finalizationReason === 'expired').length;

  const statsCards = [
    { label: 'Total Finalizadas', value: totalFinalized, icon: Archive, color: 'text-foreground', bgColor: 'bg-primary/10' },
    { label: 'Preenchidas', value: totalFilled, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { label: 'Canceladas', value: totalCancelled, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { label: 'Expiradas', value: totalExpired, icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  ];

  const getHiredCandidate = (jobId: string) => {
    return hires.find((h) => h.jobId === jobId);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Archive className="w-8 h-8 text-cyan-600" />
            Vagas Finalizadas
          </h1>
          <p className="text-muted-foreground mt-1">
            Historico de vagas encerradas na plataforma
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bgColor)}>
                <card.icon className={cn('w-5 h-5', card.color)} />
              </div>
              <p className={cn('text-xl font-bold', card.color)}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos os motivos</SelectItem>
              <SelectItem value="filled">Preenchidas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
            </SelectContent>
          </Select>
          {reasonFilter && reasonFilter !== '__all__' && (
            <Button variant="ghost" size="sm" onClick={() => setReasonFilter('')}>
              Limpar filtro
            </Button>
          )}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-soft overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="hidden md:table-cell">Data Finalizacao</TableHead>
                  <TableHead className="text-center">Candidaturas</TableHead>
                  <TableHead className="hidden lg:table-cell">Candidato Contratado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhuma vaga finalizada encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((job) => {
                    const reason = job.finalizationReason as FinalizationReason;
                    const reasonCfg = REASON_CONFIG[reason] || REASON_CONFIG.expired;
                    const hired = reason === 'filled' ? getHiredCandidate(job.id) : null;

                    return (
                      <TableRow key={job.id}>
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
                            <span className="text-sm">{job.companyName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-[10px]', reasonCfg.className)}>
                            <reasonCfg.icon className="w-3 h-3 mr-1" />
                            {reasonCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(job.finalizedAt)}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {job.applicationsCount}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {hired ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={hired.candidateAvatar} />
                                <AvatarFallback className="text-[10px]">
                                  {hired.candidateName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{hired.candidateName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

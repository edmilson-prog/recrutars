/**
 * AdminInterviews Page
 * PRD-058: Entrevistas com abas (Agendadas, Realizadas, Canceladas)
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AdminInterview } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const MODE_BADGES: Record<string, { label: string; icon: typeof Video; className: string }> = {
  online: {
    label: 'Online',
    icon: Video,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  },
  presencial: {
    label: 'Presencial',
    icon: MapPin,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
};

const OUTCOME_BADGES: Record<string, { label: string; className: string }> = {
  approved: {
    label: 'Aprovado',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  },
  hired: {
    label: 'Contratado',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: 'Agendada',
    className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
  },
  completed: {
    label: 'Realizada',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  },
};

function InterviewTable({ interviews }: { interviews: AdminInterview[] }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (interviews.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nenhuma entrevista encontrada nesta categoria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidato</TableHead>
            <TableHead>Vaga</TableHead>
            <TableHead className="hidden md:table-cell">Empresa</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="hidden sm:table-cell">Modo</TableHead>
            <TableHead>Status</TableHead>
            {interviews[0]?.status === 'completed' && (
              <TableHead>Resultado</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.map((interview) => {
            const modeBadge = MODE_BADGES[interview.mode];
            const statusBadge = STATUS_BADGES[interview.status];

            return (
              <TableRow key={interview.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={interview.candidateAvatar} />
                      <AvatarFallback className="text-[10px]">
                        {interview.candidateName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{interview.candidateName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">
                  {interview.jobTitle}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={interview.companyLogo} />
                      <AvatarFallback className="text-[8px]">
                        {interview.companyName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{interview.companyName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(interview.scheduledDate)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary" className={cn('text-[10px]', modeBadge.className)}>
                    <modeBadge.icon className="w-3 h-3 mr-1" />
                    {modeBadge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn('text-[10px]', statusBadge.className)}>
                    {statusBadge.label}
                  </Badge>
                </TableCell>
                {interview.status === 'completed' && (
                  <TableCell>
                    {interview.outcome ? (
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px]', OUTCOME_BADGES[interview.outcome]?.className)}
                      >
                        {interview.outcome === 'hired' && <UserCheck className="w-3 h-3 mr-1" />}
                        {interview.outcome === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {interview.outcome === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {OUTCOME_BADGES[interview.outcome]?.label || interview.outcome}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminInterviews() {
  const { interviews } = useAdminJobs();

  const scheduled = useMemo(
    () => interviews
      .filter((i) => i.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [interviews]
  );

  const completed = useMemo(
    () => interviews
      .filter((i) => i.status === 'completed')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [interviews]
  );

  const cancelled = useMemo(
    () => interviews
      .filter((i) => i.status === 'cancelled')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [interviews]
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Entrevistas"
          description="Acompanhamento de todas as entrevistas da plataforma. Visualize agendamentos, realizadas e canceladas."
          howItWorks={[
            'Todas as entrevistas agendadas na plataforma',
            'Filtre por status: agendadas, realizadas, canceladas',
            'Acompanhe métricas de comparecimento e conclusão',
          ]}
        />

        <AdminTabNav />

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs defaultValue="scheduled" className="w-full">
            <TabsList className="w-full flex">
              <TabsTrigger value="scheduled" className="flex-1">
                Agendadas ({scheduled.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Realizadas ({completed.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                Canceladas ({cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="mt-4">
              <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <InterviewTable interviews={scheduled} />
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <InterviewTable interviews={completed} />
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4">
              <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <InterviewTable interviews={cancelled} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

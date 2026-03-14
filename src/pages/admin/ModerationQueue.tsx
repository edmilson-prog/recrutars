/**
 * ModerationQueue Page
 * PRD-058: Fila de moderacao de vagas pendentes
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Building2,
  Inbox,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { useModeration } from '@/hooks/useModeration';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModerationActions } from '@/components/admin/jobs/ModerationActions';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

function getTimeInQueue(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h na fila`;
  if (hours > 0) return `${hours}h na fila`;
  const mins = Math.floor(diffMs / (1000 * 60));
  return `${mins}min na fila`;
}

export default function ModerationQueue() {
  const navigate = useNavigate();
  const { moderationQueue, approveJob, rejectJob, requestCorrection } = useAdminJobs();
  const { config } = useModeration();

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Fila de Moderação"
          description={<>Revise e aprove vagas pendentes. {moderationQueue.length} vaga{moderationQueue.length !== 1 ? 's' : ''} aguardando aprovação.</>}
          howItWorks={[
            'Revise itens pendentes de moderacao',
            'Aprove, rejeite ou solicite alteracoes em cada item',
            'Filtre por tipo de conteudo e data de submissao',
          ]}
        />

        <AdminTabNav />

        {/* Queue */}
        {moderationQueue.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-12 shadow-soft text-center"
          >
            <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Fila vazia</h2>
            <p className="text-muted-foreground mt-1">
              Nao ha vagas pendentes de moderacao no momento.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {moderationQueue.map((job, index) => {
              const timeInQueue = getTimeInQueue(job.createdAt);
              const isOverdue =
                (new Date().getTime() - new Date(job.createdAt).getTime()) >
                config.maxPendingHours * 60 * 60 * 1000;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'bg-card rounded-2xl p-6 shadow-soft border',
                    isOverdue
                      ? 'border-red-300 dark:border-red-500/30'
                      : 'border-border'
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={job.companyLogo} />
                          <AvatarFallback>{job.companyName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {job.companyName}
                              {job.isAnonymous && (
                                <EyeOff className="w-3 h-3 text-muted-foreground" title="Empresa confidencial para candidatos" />
                              )}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {job.companyPlan}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock
                                className={cn(
                                  'w-3.5 h-3.5',
                                  isOverdue ? 'text-red-500' : 'text-muted-foreground'
                                )}
                              />
                              <span className={cn(isOverdue && 'text-red-500 font-medium')}>
                                {timeInQueue}
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {job.area} - {job.location} - {job.type}
                            {job.salary ? ` - ${job.salary}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <ModerationActions
                        job={job}
                        onApprove={approveJob}
                        onReject={rejectJob}
                        onRequestCorrection={requestCorrection}
                        reasons={config.rejectionReasons}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => navigate(`/admin/vagas/${job.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

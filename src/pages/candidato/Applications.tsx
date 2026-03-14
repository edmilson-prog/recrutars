/**
 * My Applications Page
 * PRD-009: Minhas Candidaturas
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Briefcase,
  Clock,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  Ban,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { ApplicationStatus } from '@/types';

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-muted text-muted-foreground', icon: Clock },
  reviewing: { label: 'Em análise', color: 'bg-warning/10 text-warning', icon: Eye },
  interview: { label: 'Entrevista', color: 'bg-secondary/10 text-secondary', icon: Calendar },
  offer: { label: 'Proposta', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Reprovado', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  hired: { label: 'Contratado', color: 'bg-success/10 text-success', icon: Award },
  withdrawn: { label: 'Desistência', color: 'bg-muted text-muted-foreground', icon: Ban },
};

const filterOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'reviewing', label: 'Em análise' },
  { value: 'interview', label: 'Entrevista' },
  { value: 'offer', label: 'Propostas' },
  { value: 'rejected', label: 'Reprovadas' },
  { value: 'withdrawn', label: 'Desistências' },
];

export default function CandidateApplications() {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id ?? '';
  const { applications, isLoading, cancelApplication } = useApplications(candidateId);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  // Counters
  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
  };

  // Check if application can be cancelled
  const canCancel = (status: ApplicationStatus) =>
    status === 'pending' || status === 'reviewing';

  // Open cancel modal
  const openCancelModal = (appId: string) => {
    setSelectedAppId(appId);
    setShowCancelModal(true);
  };

  // Handle cancel confirmation
  const handleCancelApplication = () => {
    if (selectedAppId) {
      cancelApplication(selectedAppId);
      setShowCancelModal(false);
      setSelectedAppId(null);
      toast.success('Candidatura cancelada com sucesso');
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get count for a specific status
  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(a => a.status === status).length;
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Candidaturas</h1>
          <p className="text-muted-foreground">Acompanhe o status das suas candidaturas</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{counts.total}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Em análise</p>
            <p className="text-2xl font-bold text-warning">{counts.reviewing}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Entrevistas</p>
            <p className="text-2xl font-bold text-secondary">{counts.interview}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Propostas</p>
            <p className="text-2xl font-bold text-success">{counts.offer}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
                className={statusFilter === option.value ? 'gradient-primary' : ''}
              >
                {option.label}
                <span className="ml-2 text-xs opacity-70">
                  ({getStatusCount(option.value)})
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((app, index) => {
            const StatusIcon = statusConfig[app.status].icon;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{app.jobTitle}</h3>
                      <p className="text-muted-foreground">{app.companyName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Candidatura: {formatDate(app.appliedAt)}
                      </p>
                      {app.updatedAt !== app.appliedAt && (
                        <p className="text-xs text-muted-foreground">
                          Atualizado: {formatDate(app.updatedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge className={`${statusConfig[app.status].color} flex items-center gap-1.5 px-3 py-1.5`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[app.status].label}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/candidato/vagas/${app.jobId}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver vaga
                  </Button>
                  {canCancel(app.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openCancelModal(app.id)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancelar candidatura
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-card rounded-2xl shadow-soft"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {statusFilter === 'all'
                  ? 'Você ainda não se candidatou a nenhuma vaga'
                  : 'Nenhuma candidatura com esse status'}
              </h3>
              <p className="text-muted-foreground mb-6">
                Explore as vagas disponíveis e encontre sua próxima oportunidade
              </p>
              <Button onClick={() => navigate('/candidato/vagas')} className="gradient-primary">
                Buscar vagas
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar candidatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desistir desta candidatura?
              Esta ação não pode ser desfeita e a empresa será notificada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelApplication}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

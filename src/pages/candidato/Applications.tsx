/**
 * My Applications Page
 * PRD-009: Minhas Candidaturas
 */

import { useState, type MouseEvent } from 'react';
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
  ShieldCheck,
  ShieldOff,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import { useConsentDecision } from '@/hooks/useConsentDecision';
import { useCandidateDisclosures } from '@/hooks/useCandidateDisclosures';
import { ConsentTermDialog } from '@/components/consent/ConsentTermDialog';
import { computeTermHash, CONSENT_TERM_VERSION, CONSENT_TERM_TEXT } from '@/lib/consentTerm';
import type { ConsentTermParties } from '@/components/consent/consentTermHtml';
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

  // Consent state and hooks
  const { data: disclosures = {} } = useCandidateDisclosures(candidateId);
  const { accept, refuse, revoke } = useConsentDecision();

  const [consentAppId, setConsentAppId] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [revokeAppId, setRevokeAppId] = useState<string | null>(null);
  const [termAppId, setTermAppId] = useState<string | null>(null);

  const selectedApp = applications.find(a => a.id === consentAppId) ?? null;
  const revokeApp = applications.find(a => a.id === revokeAppId) ?? null;
  const termApp = applications.find(a => a.id === termAppId) ?? null;
  const termDisclosure = termAppId ? disclosures[termAppId] : undefined;

  const buildParties = (appId: string): ConsentTermParties => {
    const app = applications.find(a => a.id === appId);
    return {
      candidateName: currentCandidate?.name ?? app?.candidateName ?? 'Candidato',
      candidateCpf: currentCandidate?.cpf ?? undefined,
      companyName: app?.companyName ?? '',
      companyLogo: null,
      jobTitle: app?.jobTitle ?? '',
      operatorName: 'RecrutaRS',
    };
  };

  const openConsentModal = (appId: string) => {
    setConsentAppId(appId);
    setConsentChecked(false);
  };

  const handleAccept = async () => {
    if (!consentAppId || !consentChecked) return;
    try {
      const termHash = await computeTermHash(CONSENT_TERM_TEXT);
      await accept.mutateAsync({
        applicationId: consentAppId,
        termVersion: CONSENT_TERM_VERSION,
        termHash,
      });
      setConsentAppId(null);
    } catch {
      // toast is fired by useConsentDecision onError
    }
  };

  const handleRefuse = async () => {
    if (!consentAppId) return;
    try {
      await refuse.mutateAsync(consentAppId);
      toast.success('Você optou por não compartilhar agora');
      setConsentAppId(null);
    } catch {
      toast.error('Não foi possível registrar a recusa. Tente novamente.');
    }
  };

  const handleRevoke = async (e: MouseEvent) => {
    e.preventDefault(); // prevent AlertDialogAction from auto-closing before async completes
    if (!revokeAppId) return;
    try {
      await revoke.mutateAsync(revokeAppId);
    } catch {
      // toast is fired by useConsentDecision onError
    } finally {
      setRevokeAppId(null);
    }
  };

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
                  {disclosures[app.id]?.status === 'pending' && app.status === 'offer' && (
                    <Button
                      size="sm"
                      className="gradient-primary"
                      onClick={() => openConsentModal(app.id)}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Revisar compartilhamento
                    </Button>
                  )}
                  {disclosures[app.id]?.status === 'accepted' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTermAppId(app.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver termo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRevokeAppId(app.id)}
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Revogar autorização
                      </Button>
                    </>
                  )}
                  {disclosures[app.id]?.status === 'refused' && app.status === 'offer' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConsentModal(app.id)}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Autorizar compartilhamento
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

      {/* Modal de decisão de consentimento (aceitar/recusar) */}
      <Dialog open={!!consentAppId} onOpenChange={(o) => !o && setConsentAppId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Você foi aprovado!
            </DialogTitle>
            <DialogDescription>
              {selectedApp
                ? `${selectedApp.companyName} aprovou sua candidatura para "${selectedApp.jobTitle}". Para prosseguir, autorize o compartilhamento dos seus dados de contato.`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Dados que serão compartilhados</p>
              <ul className="space-y-1 text-muted-foreground">
                {['CPF', 'E-mail', 'Telefone', 'Data de nascimento', 'Endereço'].map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Finalidade</p>
              <p className="text-muted-foreground">
                Permitir que a empresa entre em contato e formalize sua contratação. Base legal:
                consentimento (Art. 7º, I, da LGPD).
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Seus direitos</p>
              <p className="text-muted-foreground">
                Você pode revogar esta autorização a qualquer momento — os dados voltam a ficar
                ocultos. O termo fica disponível para impressão e download.
              </p>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="consent-acknowledge"
                checked={consentChecked}
                onCheckedChange={(c) => setConsentChecked(c === true)}
              />
              <Label htmlFor="consent-acknowledge" className="text-sm leading-snug cursor-pointer">
                Li e autorizo o compartilhamento dos meus dados pessoais com a empresa para fins de
                contratação.
              </Label>
            </div>

            <p className="text-xs text-muted-foreground">
              O aceite é registrado com data, hora, IP e versão do termo para auditoria.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={handleRefuse}
              disabled={refuse.isPending || accept.isPending}
            >
              Agora não
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!consentChecked || accept.isPending || refuse.isPending}
            >
              {accept.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registrando…</>
              ) : (
                'Autorizar e compartilhar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de revogação */}
      <AlertDialog open={!!revokeAppId} onOpenChange={(o) => !o && setRevokeAppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar autorização?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeApp
                ? `Seus dados de contato voltarão a ficar ocultos para ${revokeApp.companyName}. A empresa será notificada. Artefatos já baixados podem não ser recolhíveis.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoke.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoke.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Revogando…</>
              ) : (
                'Confirmar revogação'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Termo de consentimento */}
      {termApp && termDisclosure && (
        <ConsentTermDialog
          open={!!termAppId}
          onOpenChange={(o) => !o && setTermAppId(null)}
          disclosure={termDisclosure}
          parties={buildParties(termApp.id)}
        />
      )}
    </DashboardLayout>
  );
}

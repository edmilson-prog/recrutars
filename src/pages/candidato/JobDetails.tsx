/**
 * Job Details Page
 * PRD-006: Busca e Visualização de Vagas
 * PRD-007: Candidatura a Vagas
 * PRD-002-dgn: Match Score e visualização Comportamental
 */

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, DollarSign, Calendar, Briefcase, Heart, Users, CheckCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJob } from '@/hooks/useJobsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { getOrGenerateIdealProfile } from '@/lib/behavioralProfiles';
import { toast } from 'sonner';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { useFavoriteJobs } from '@/hooks/useFavoriteJobs';
import { useProfile } from '@/hooks/useCurriculumsQuery';
import { useSetApplicationHighlights } from '@/hooks/useHighlightsQuery';
import { ApplicationModal } from '@/components/candidato/ApplicationModal';
import { ApplicationSuccessModal } from '@/components/candidato/ApplicationSuccessModal';
import type { ApplicationHighlights } from '@/types/applicationHighlight';
// PRD-002-dgn: Componentes de Match e Comportamental
import { MatchBreakdown } from '@/components/match/MatchBreakdown';
import { MatchStrengths } from '@/components/match/MatchStrengths';
import { MatchOpportunities } from '@/components/match/MatchOpportunities';
import { MatchComparison } from '@/components/match/MatchComparison';
// PRD-035: Modal de metodologia
import { MatchMethodologyModal } from '@/components/match/MatchMethodologyModal';
// PRD-035: Banner de incentivo ao teste comportamental
import { DiscIncentiveBanner } from '@/components/candidato/DiscIncentiveBanner';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();

  // Fetch job from service layer
  const { data: job, isLoading: isLoadingJob } = useJob(id ?? '');

  // Favorites hook (PRD-024)
  const { isFavorite, toggleFavorite } = useFavoriteJobs();

  // Application state
  const candidateId = currentCandidate?.id ?? '';
  const { hasApplied, createApplicationAsync } = useApplications(candidateId);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // PRD-073: Profile + Highlights
  const { data: profile } = useProfile(candidateId);
  const setHighlightsMutation = useSetApplicationHighlights();

  // PRD-035: Cálculo dinâmico de match
  const idealProfile = job ? getOrGenerateIdealProfile(job) : undefined;
  const matchResult = job && currentCandidate
    ? calculateMatchBreakdown(currentCandidate, job, idealProfile)
    : undefined;

  // Loading state
  if (isLoadingJob) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout userType="candidate">
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Vaga não encontrada</h1>
          <p className="text-muted-foreground mb-6">A vaga que você está procurando não existe ou foi removida.</p>
          <Button onClick={() => navigate('/candidato/vagas')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para vagas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isAlreadyApplied = hasApplied(job.id);

  const handleApplyClick = () => {
    if (isAlreadyApplied) return;
    setShowApplicationModal(true);
  };

  const handleConfirmApplication = async (message?: string, highlights?: ApplicationHighlights) => {
    try {
      const application = await createApplicationAsync(
        job.id,
        job.title,
        job.companyName,
        'Candidato Atual',
        message
      );

      // PRD-073: Save highlights if selected
      if (highlights && application?.id) {
        const hasHighlights =
          highlights.experienceIds.length > 0 ||
          highlights.educationIds.length > 0 ||
          highlights.skillIds.length > 0 ||
          highlights.courseIds.length > 0;

        if (hasHighlights) {
          setHighlightsMutation.mutate({
            applicationId: application.id,
            highlights,
          });
        }
      }

      setShowApplicationModal(false);
      setShowSuccessModal(true);
      toast.success('Candidatura enviada com sucesso!');
    } catch {
      toast.error('Erro ao enviar candidatura. Tente novamente.');
    }
  };

  const handleViewApplications = () => {
    setShowSuccessModal(false);
    navigate('/candidato/candidaturas');
  };

  const handleContinueBrowsing = () => {
    setShowSuccessModal(false);
    navigate('/candidato/vagas');
  };

  const toggleSave = () => {
    if (!job) return;
    const isNowFavorite = toggleFavorite(job.id);
    toast.success(isNowFavorite ? 'Vaga salva!' : 'Vaga removida');
  };

  const isSaved = job ? isFavorite(job.id) : false;

  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'remote': return 'Remoto';
      case 'hybrid': return 'Híbrido';
      case 'onsite': return 'Presencial';
      default: return type;
    }
  };

  return (
    <DashboardLayout userType="candidate">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para vagas
        </Button>

        {/* Job Header */}
        <div className="bg-card rounded-2xl p-8 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{job.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">{job.companyName}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-primary text-primary-foreground">{job.level}</Badge>
                <Badge variant="secondary">{getTypeLabel(job.type)}</Badge>
                <Badge variant="outline">{job.area}</Badge>
              </div>
            </div>
            <div className="flex gap-3 md:flex-col w-full md:w-auto">
              <Button
                className={`flex-1 md:flex-none ${isAlreadyApplied ? '' : 'gradient-primary'}`}
                onClick={handleApplyClick}
                disabled={isAlreadyApplied}
                variant={isAlreadyApplied ? 'secondary' : 'default'}
              >
                {isAlreadyApplied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Já candidatado
                  </>
                ) : (
                  'Candidatar-se'
                )}
              </Button>
              <Button variant="outline" onClick={toggleSave}>
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-medium text-foreground">{job.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salário</p>
                <p className="font-medium text-foreground">{formatSalary(job.salary.min, job.salary.max)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publicado em</p>
                <p className="font-medium text-foreground">{formatDate(job.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Candidaturas</p>
                <p className="font-medium text-foreground">{job.applicationsCount} candidatos</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRD-035: Banner de incentivo ao teste comportamental (quando match < 80%) */}
        {matchResult && matchResult.totalScore < 80 && (
          <DiscIncentiveBanner
            context="job_low_match"
            currentMatch={matchResult.totalScore}
            potentialMatch={Math.min(matchResult.totalScore + 15, 95)}
          />
        )}

        {/* PRD-002-dgn: Match Score Section */}
        {matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <MatchBreakdown
              totalScore={matchResult.totalScore}
              categories={matchResult.categories}
              title="Sua Compatibilidade"
              layout="horizontal"
            />
            <div className="flex justify-end">
              <MatchMethodologyModal />
            </div>
          </motion.div>
        )}

        {/* PRD-002-dgn: Behavioral Comparison */}
        {matchResult?.candidateProfile && matchResult?.idealProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MatchComparison
              candidateProfile={matchResult.candidateProfile}
              idealProfile={matchResult.idealProfile}
              matchScore={matchResult.totalScore}
              title="Comparação de Perfil Comportamental"
            />
          </motion.div>
        )}

        {/* PRD-002-dgn: Strengths and Opportunities */}
        {matchResult && (matchResult.strengths.length > 0 || matchResult.opportunities.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {matchResult.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MatchStrengths strengths={matchResult.strengths} />
              </motion.div>
            )}
            {matchResult.opportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <MatchOpportunities opportunities={matchResult.opportunities} />
              </motion.div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-foreground mb-4">Descrição da vaga</h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-foreground mb-4">Requisitos</h2>
          <ul className="space-y-3">
            {job.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground">
                <span className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-foreground mb-4">Benefícios</h2>
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((benefit, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-success/10 text-success border-success/20 px-3 py-1"
              >
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-foreground mb-4">Sobre a empresa</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{job.companyName}</h3>
              <p className="text-muted-foreground">
                {job.applicationsCount} candidaturas recebidas para esta vaga
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        {!isAlreadyApplied && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Interessado nesta vaga?
            </h3>
            <p className="text-muted-foreground mb-6">
              Envie sua candidatura agora e dê o próximo passo na sua carreira!
            </p>
            <Button size="lg" className="gradient-primary" onClick={handleApplyClick}>
              Candidatar-se a esta vaga
            </Button>
          </div>
        )}

        {/* Already Applied Footer */}
        {isAlreadyApplied && (
          <div className="bg-success/10 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Você já se candidatou!
            </h3>
            <p className="text-muted-foreground mb-6">
              Acompanhe o status da sua candidatura na página "Minhas Candidaturas".
            </p>
            <Button variant="outline" onClick={() => navigate('/candidato/candidaturas')}>
              Ver Minhas Candidaturas
            </Button>
          </div>
        )}
      </motion.div>

      {/* Application Modal */}
      <ApplicationModal
        job={job}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onConfirm={handleConfirmApplication}
        curriculum={profile}
      />

      {/* Success Modal */}
      <ApplicationSuccessModal
        isOpen={showSuccessModal}
        onViewApplications={handleViewApplications}
        onContinueBrowsing={handleContinueBrowsing}
      />
    </DashboardLayout>
  );
}

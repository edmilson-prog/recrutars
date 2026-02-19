/**
 * Saved Jobs Page
 * PRD-024: Vagas Favoritas
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Search,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { toast } from 'sonner';
import { useFavoriteJobs, formatSavedAt, getDaysUntilDeadline } from '@/hooks/useFavoriteJobs';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';
import { getDisplayCompanyName } from '@/lib/anonymousJob';

type SortOption = 'recent' | 'match' | 'deadline';

export default function SavedJobs() {
  const navigate = useNavigate();
  const { getFavoriteJobs, removeFavorite, toggleFavorite } = useFavoriteJobs();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id ?? '';
  const { hasApplied } = useApplications(candidateId);

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [jobToRemove, setJobToRemove] = useState<string | null>(null);

  // Obter vagas salvas com dados
  const savedJobs = useMemo(() => {
    return getFavoriteJobs();
  }, [getFavoriteJobs]);

  // Ordenar vagas
  const sortedJobs = useMemo(() => {
    return [...savedJobs].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          // Por enquanto, usar salário como proxy para match
          return b.salary.max - a.salary.max;
        case 'deadline':
          // Vagas com deadline próximo primeiro
          const deadlineA = getDaysUntilDeadline(a.deadline) ?? 999;
          const deadlineB = getDaysUntilDeadline(b.deadline) ?? 999;
          return deadlineA - deadlineB;
        case 'recent':
        default:
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
    });
  }, [savedJobs, sortBy]);

  const handleToggleFavorite = (jobId: string) => {
    const isNowFavorite = toggleFavorite(jobId);
    toast.success(isNowFavorite ? 'Vaga salva!' : 'Vaga removida');
  };

  const handleRemoveConfirm = () => {
    if (jobToRemove) {
      removeFavorite(jobToRemove);
      toast.success('Vaga removida da lista');
      setJobToRemove(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'remote':
        return 'Remoto';
      case 'hybrid':
        return 'Híbrido';
      case 'onsite':
        return 'Presencial';
      default:
        return type;
    }
  };

  const isJobClosed = (job: Job) => job.status !== 'active';

  const renderJobCard = (job: Job & { savedAt: string }, index: number) => {
    const isClosed = isJobClosed(job);
    const daysUntilDeadline = getDaysUntilDeadline(job.deadline);
    const isDeadlineSoon = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline > 0;
    const isAlreadyApplied = hasApplied(job.id);

    return (
      <motion.div
        key={job.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all ${
          isClosed ? 'opacity-75' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isClosed ? 'bg-muted' : 'bg-primary/10'
            }`}
          >
            <Building2
              className={`w-7 h-7 ${isClosed ? 'text-muted-foreground' : 'text-primary'}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-xl font-semibold ${
                      isClosed ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {job.title}
                  </h3>
                  {isClosed && (
                    <Badge variant="destructive" className="text-xs">
                      Encerrada
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{getDisplayCompanyName(job)}</p>
              </div>

              <button
                onClick={() => handleToggleFavorite(job.id)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5 fill-destructive text-destructive transition-colors" />
              </button>
            </div>

            {!isClosed && (
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {getTypeLabel(job.type)}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  R$ {job.salary.min.toLocaleString('pt-BR')} -{' '}
                  {job.salary.max.toLocaleString('pt-BR')}
                </span>
              </div>
            )}

            {isClosed && (
              <p className="mt-3 text-muted-foreground">
                Esta vaga não está mais disponível.
              </p>
            )}

            <div className="flex items-center gap-4 mt-4">
              {isDeadlineSoon && !isClosed && (
                <Badge
                  variant="outline"
                  className="bg-warning/10 text-warning border-warning/30"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Encerra em {daysUntilDeadline} dia{daysUntilDeadline !== 1 ? 's' : ''}
                </Badge>
              )}
              {isAlreadyApplied && !isClosed && (
                <Badge className="bg-success/20 text-success border-success/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Candidatado
                </Badge>
              )}
              <Badge variant="secondary">{job.level}</Badge>
              <Badge variant="outline">{job.area}</Badge>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatSavedAt(job.savedAt)}
              </span>

              <div className="flex gap-2">
                {isClosed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJobToRemove(job.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover da lista
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/candidato/vagas/${job.id}`)}
                    >
                      Ver detalhes
                    </Button>
                    {!isAlreadyApplied && (
                      <Button
                        size="sm"
                        className="gradient-primary"
                        onClick={() => navigate(`/candidato/vagas/${job.id}`)}
                      >
                        Candidatar-se
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Heart className="w-8 h-8 text-destructive" />
            Vagas Salvas
          </h1>
          <p className="text-muted-foreground">
            Vagas que você salvou para analisar depois
          </p>
        </div>

        {savedJobs.length > 0 ? (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Você tem {savedJobs.length} vaga{savedJobs.length !== 1 ? 's' : ''} salva
                {savedJobs.length !== 1 ? 's' : ''}
              </p>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="match">Maior salário</SelectItem>
                    <SelectItem value="deadline">Prazo mais próximo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {sortedJobs.map((job, index) => renderJobCard(job, index))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Você ainda não salvou nenhuma vaga
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ao encontrar vagas interessantes, clique no{' '}
              <Heart className="w-4 h-4 inline text-destructive" /> para salvá-las e
              analisar depois.
            </p>
            <Button onClick={() => navigate('/candidato/vagas')}>
              <Search className="w-4 h-4 mr-2" />
              Buscar Vagas
            </Button>
          </div>
        )}
      </div>

      {/* Dialog de confirmação de remoção */}
      <AlertDialog open={!!jobToRemove} onOpenChange={() => setJobToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vaga da lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta vaga será removida das suas vagas salvas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

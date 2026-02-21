/**
 * CompareCandidates Page
 * PRD-048: Teste por Vaga
 *
 * Comparação lado a lado de candidatos que completaram o teste
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, FileQuestion, Users, Plus, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CandidateComparison } from '@/components/job-assessment';
import { useJob } from '@/hooks/useJobsQuery';
import {
  useJobAssessmentByJob,
  useJobAssessmentResults,
} from '@/hooks/useJobAssessmentsQuery';

export default function CompareCandidates() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch real data from Supabase
  const { data: job } = useJob(jobId || '');
  const { data: assessment, isLoading: isLoadingAssessment } = useJobAssessmentByJob(jobId || '');
  const { data: results = [], isLoading: isLoadingResults } = useJobAssessmentResults(
    assessment?.id || '',
  );

  // Map results to candidate comparison format
  const candidatesWithResults = useMemo(() => {
    return results.map((r) => ({
      id: r.candidateId,
      name: r.candidateName || r.candidateId,
      email: r.candidateEmail || '',
      overallScore: r.overallScore,
      competencyScores: r.competencyScores,
      completedAt: r.createdAt,
    }));
  }, [results]);

  // Competencies from the assessment
  const competencyIds = useMemo(() => {
    if (!assessment) return [];
    return [
      ...assessment.competencies.critical,
      ...assessment.competencies.important,
    ];
  }, [assessment]);

  // Selected candidates for comparison
  const selectedCandidates = useMemo(() => {
    return candidatesWithResults.filter((c) => selectedIds.includes(c.id));
  }, [selectedIds, candidatesWithResults]);

  const isLoading = isLoadingAssessment || isLoadingResults;

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!job || !assessment) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Teste não encontrado
          </h2>
          <Button onClick={() => navigate('/empresa/vagas')}>
            Voltar para Vagas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleRemoveCandidate = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/empresa/vagas/${jobId}/teste`)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              Comparar Candidatos
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{job.title}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{assessment.title}</span>
            </div>
          </div>
        </motion.div>

        {candidatesWithResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhum resultado disponível
            </h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Ainda não há candidatos que completaram o teste para comparação.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/empresa/vagas/${jobId}/teste`)}
            >
              Voltar para Gestão
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lista de candidatos para selecionar */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-xl border p-4 sticky top-4">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Candidatos ({candidatesWithResults.length})
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  Selecione até 4 candidatos para comparar lado a lado.
                </p>

                <div className="space-y-2">
                  {candidatesWithResults.map((candidate) => {
                    const isSelected = selectedIds.includes(candidate.id);
                    const canSelect = selectedIds.length < 4 || isSelected;

                    return (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                          ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : canSelect
                                ? 'hover:border-primary/50'
                                : 'opacity-50 cursor-not-allowed'
                          }
                        `}
                        onClick={() => canSelect && toggleCandidate(candidate.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={!canSelect}
                          onCheckedChange={() =>
                            canSelect && toggleCandidate(candidate.id)
                          }
                        />

                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {candidate.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score: {candidate.overallScore}%
                          </p>
                        </div>

                        <Badge
                          variant={
                            candidate.overallScore >= 80
                              ? 'default'
                              : candidate.overallScore >= 60
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            candidate.overallScore >= 80 ? 'bg-success' : ''
                          }
                        >
                          {candidate.overallScore}%
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedIds.length === 0 && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
                    <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Selecione candidatos para iniciar a comparação
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Área de comparação */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-xl border p-4 min-h-[500px]">
                <CandidateComparison
                  candidates={selectedCandidates}
                  competencyIds={
                    competencyIds.length > 0
                      ? competencyIds
                      : Object.keys(
                          candidatesWithResults[0]?.competencyScores || {},
                        )
                  }
                  onRemoveCandidate={handleRemoveCandidate}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

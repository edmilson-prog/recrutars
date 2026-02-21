/**
 * CandidateTestReport Page
 * PRD-048: Teste por Vaga
 *
 * Relatório detalhado do teste de um candidato
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, FileQuestion, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { CandidateReport } from '@/components/job-assessment';
import { useJob } from '@/hooks/useJobsQuery';
import {
  useJobAssessmentByJob,
  useJobAssessmentResults,
  useUpdateRecruiterDecision,
} from '@/hooks/useJobAssessmentsQuery';
import { assessmentQuestions } from '@/data/assessmentData';
import { useToast } from '@/hooks/use-toast';
import type { JobAssessmentResult } from '@/types/assessment';

export default function CandidateTestReport() {
  const { jobId, candidateId } = useParams<{
    jobId: string;
    candidateId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch real data from Supabase
  const { data: job } = useJob(jobId || '');
  const { data: assessment, isLoading: isLoadingAssessment } = useJobAssessmentByJob(jobId || '');
  const { data: allResults = [], isLoading: isLoadingResults } = useJobAssessmentResults(
    assessment?.id || '',
  );

  const updateDecision = useUpdateRecruiterDecision();

  // Find result for this candidate
  const result = useMemo(() => {
    return allResults.find((r) => r.candidateId === candidateId) || null;
  }, [allResults, candidateId]);

  // Local state for adjustments (optimistic)
  const [localResult, setLocalResult] = useState<JobAssessmentResult | null>(null);
  const activeResult = localResult || result;

  // Questions from the assessment
  const testQuestions = useMemo(() => {
    if (!assessment) return [];
    return assessmentQuestions.filter((q) =>
      assessment.questionsIds.includes(q.id),
    );
  }, [assessment]);

  // Mock responses until real response data is available
  const responses = useMemo(() => {
    if (activeResult?.responses && activeResult.responses.length > 0) {
      return activeResult.responses.map((r) => ({
        questionId: r.questionId,
        response: r.response,
        aiScore: r.score ? Math.round(r.score / 20) : 3,
      }));
    }
    // Generate placeholder responses for display
    if (assessment) {
      return assessment.questionsIds.map((qId) => ({
        questionId: qId,
        response: '3',
        aiScore: 3,
      }));
    }
    return [];
  }, [activeResult, assessment]);

  const isLoading = isLoadingAssessment || isLoadingResults;

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando relatório...</p>
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

  if (!activeResult) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Resultado não encontrado
          </h2>
          <p className="text-muted-foreground mb-4">
            Este candidato não completou o teste ou não existe.
          </p>
          <Button onClick={() => navigate(`/empresa/vagas/${jobId}/teste`)}>
            Voltar para Gestão
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Candidate info from result
  const candidate = {
    id: activeResult.candidateId,
    name: activeResult.candidateName || activeResult.candidateId,
    email: activeResult.candidateEmail || '',
  };

  // Handlers
  const handleAdjustScore = (
    questionId: string,
    newScore: number,
    note?: string,
  ) => {
    setLocalResult((prev) => {
      const base = prev || activeResult;
      if (!base) return prev;

      return {
        ...base,
        recruiterAdjustments: {
          ...base.recruiterAdjustments,
          adjustedScores: [
            ...(base.recruiterAdjustments?.adjustedScores || []).filter(
              (a) => a.questionId !== questionId,
            ),
            {
              questionId,
              originalScore:
                responses.find((r) => r.questionId === questionId)?.aiScore || 0,
              adjustedScore: newScore,
              note,
            },
          ],
        },
      };
    });
  };

  const handleDecision = async (
    decision: 'approved' | 'pending' | 'rejected',
    notes?: string,
  ) => {
    try {
      await updateDecision.mutateAsync({
        resultId: activeResult.id,
        assessmentId: assessment.id,
        decision,
        notes,
      });

      setLocalResult((prev) => {
        const base = prev || activeResult;
        if (!base) return prev;
        return { ...base, recruiterDecision: decision, recruiterNotes: notes };
      });

      toast({
        title:
          decision === 'approved'
            ? 'Candidato aprovado!'
            : decision === 'rejected'
              ? 'Candidato reprovado'
              : 'Decisão salva',
        description:
          decision === 'approved'
            ? 'O candidato foi marcado como aprovado.'
            : decision === 'rejected'
              ? 'O candidato foi marcado como reprovado.'
              : 'A decisão será tomada posteriormente.',
      });
    } catch {
      toast({
        title: 'Erro ao salvar decisão',
        description: 'Não foi possível salvar. Tente novamente.',
        variant: 'destructive',
      });
    }
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
              Relatório do Candidato
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{job.title}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{assessment.title}</span>
            </div>
          </div>
        </motion.div>

        {/* Report */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CandidateReport
            candidate={candidate}
            result={activeResult}
            questions={testQuestions}
            responses={responses}
            completedAt={activeResult.createdAt}
            timeSpentMinutes={Math.floor(assessment.estimatedMinutes * 0.8)}
            onAdjustScore={handleAdjustScore}
            onDecision={handleDecision}
            isSubmitting={updateDecision.isPending}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

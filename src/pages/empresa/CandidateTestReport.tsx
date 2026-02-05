/**
 * CandidateTestReport Page
 * PRD-048: Teste por Vaga
 *
 * Relatório detalhado do teste de um candidato
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, FileQuestion, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { CandidateReport } from '@/components/job-assessment';
import { useJobs } from '@/hooks/useJobsQuery';
import {
  mockJobAssessments,
  mockJobAssessmentResults,
} from '@/data/behavioralAssessmentData';
import { assessmentQuestions } from '@/data/assessmentData';
import { useToast } from '@/hooks/use-toast';
import type { JobAssessmentResult } from '@/types/assessment';

// Mock de candidatos
const mockCandidateInfo: Record<
  string,
  { id: string; name: string; email: string; avatar?: string }
> = {
  'cand-1': {
    id: 'cand-1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
  },
  'cand-2': {
    id: 'cand-2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
  },
  'cand-3': {
    id: 'cand-3',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
  },
};

// Mock de respostas
function generateMockResponses(questionIds: string[]) {
  return questionIds.map((qId) => ({
    questionId: qId,
    response: Math.random() > 0.5 ? '4' : '3',
    aiScore: Math.floor(Math.random() * 3) + 3, // 3-5
  }));
}

export default function CandidateTestReport() {
  const { jobId, candidateId } = useParams<{
    jobId: string;
    candidateId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data from service layer
  const { data: jobsResult } = useJobs();
  const allJobs = jobsResult?.data ?? [];

  // Buscar dados
  const job = allJobs.find((j) => j.id === jobId);
  const assessment = mockJobAssessments.find((a) => a.jobId === jobId);
  const result = mockJobAssessmentResults.find(
    (r) => r.candidateId === candidateId
  );
  const candidate = candidateId ? mockCandidateInfo[candidateId] : null;

  // State para ajustes
  const [localResult, setLocalResult] = useState<JobAssessmentResult | null>(
    result || null
  );
  const [responses, setResponses] = useState(() => {
    if (assessment) {
      return generateMockResponses(assessment.questionsIds);
    }
    return [];
  });

  // Questões do teste
  const testQuestions = useMemo(() => {
    if (!assessment) return [];
    return assessmentQuestions.filter((q) =>
      assessment.questionsIds.includes(q.id)
    );
  }, [assessment]);

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

  if (!candidate || !localResult) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Candidato não encontrado
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

  // Handlers
  const handleAdjustScore = (
    questionId: string,
    newScore: number,
    note?: string
  ) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.questionId === questionId
          ? { ...r, recruiterScore: newScore, recruiterNote: note }
          : r
      )
    );

    // Recalcular score geral (simplificado)
    const allScores = responses.map((r) =>
      r.questionId === questionId
        ? newScore
        : r.recruiterScore ?? r.aiScore
    );
    const avgScore = Math.round(
      (allScores.reduce((sum, s) => sum + s, 0) / allScores.length) * 20
    );

    setLocalResult((prev) =>
      prev
        ? {
            ...prev,
            overallScore: avgScore,
            recruiterAdjustments: {
              ...prev.recruiterAdjustments,
              adjustedScores: [
                ...(prev.recruiterAdjustments?.adjustedScores || []).filter(
                  (a) => a.questionId !== questionId
                ),
                {
                  questionId,
                  aiScore:
                    responses.find((r) => r.questionId === questionId)
                      ?.aiScore || 0,
                  recruiterScore: newScore,
                  note,
                },
              ],
            },
          }
        : prev
    );
  };

  const handleDecision = async (
    decision: 'approved' | 'pending' | 'rejected',
    notes?: string
  ) => {
    setIsSubmitting(true);

    // Simular delay de salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLocalResult((prev) =>
      prev
        ? {
            ...prev,
            recruiterDecision: decision,
            recruiterNotes: notes,
          }
        : prev
    );

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

    setIsSubmitting(false);
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
            result={localResult}
            questions={testQuestions}
            responses={responses}
            completedAt={localResult.createdAt}
            timeSpentMinutes={Math.floor(assessment.estimatedMinutes * 0.8)}
            onAdjustScore={handleAdjustScore}
            onDecision={handleDecision}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

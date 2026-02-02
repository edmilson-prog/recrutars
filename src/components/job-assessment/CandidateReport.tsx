/**
 * CandidateReport Component
 * PRD-048: Teste por Vaga
 *
 * Relatório detalhado do candidato para o recrutador
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ResponseAnalysis } from './ResponseAnalysis';
import { RecruiterDecision } from './RecruiterDecision';
import { DimensionBadge } from '@/components/assessment';
import { assessmentCategories, assessmentDimensions } from '@/data/assessmentData';
import type {
  JobAssessmentResult,
  AssessmentQuestion,
  BehavioralRedFlag,
} from '@/types/assessment';

interface CandidateInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface CandidateReportProps {
  candidate: CandidateInfo;
  result: JobAssessmentResult;
  questions: AssessmentQuestion[];
  responses: {
    questionId: string;
    response: string;
    aiScore: number;
    recruiterScore?: number;
    recruiterNote?: string;
  }[];
  completedAt: string;
  timeSpentMinutes: number;
  onAdjustScore: (questionId: string, newScore: number, note?: string) => void;
  onDecision: (decision: 'approved' | 'pending' | 'rejected', notes?: string) => void;
  isSubmitting?: boolean;
  className?: string;
}

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CandidateReport({
  candidate,
  result,
  questions,
  responses,
  completedAt,
  timeSpentMinutes,
  onAdjustScore,
  onDecision,
  isSubmitting,
  className,
}: CandidateReportProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calcular pontos fortes e fracos
  const competencyEntries = Object.entries(result.competencyScores)
    .map(([id, score]) => ({
      id,
      name: getCategoryName(id),
      score,
    }))
    .sort((a, b) => b.score - a.score);

  const strengths = competencyEntries.slice(0, 3);
  const weaknesses = competencyEntries.slice(-3).reverse();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with candidate info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16">
            <AvatarImage src={candidate.avatar} />
            <AvatarFallback className="text-xl">
              {candidate.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{candidate.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {candidate.email}
            </p>
          </div>

          {/* Score */}
          <div className="text-center">
            <div
              className={cn(
                'text-4xl font-bold',
                result.overallScore >= 70
                  ? 'text-success'
                  : result.overallScore >= 50
                  ? 'text-amber-500'
                  : 'text-destructive'
              )}
            >
              {result.overallScore}%
            </div>
            <p className="text-sm text-muted-foreground">Score Geral</p>
          </div>
        </div>

        {/* Meta info */}
        <Separator className="my-4" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(completedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{timeSpentMinutes} minutos</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{questions.length} perguntas</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>
              {Object.keys(result.competencyScores).length} competências
            </span>
          </div>
        </div>
      </motion.div>

      {/* Red flags warning */}
      {result.redFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-destructive/10 border border-destructive/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-destructive">
                Pontos de Atenção
              </h4>
              <ul className="mt-2 space-y-1">
                {result.redFlags.map((flag, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    <span>
                      <strong>{flag.categoryName}</strong>: {flag.description} (
                      {flag.score}% - mínimo esperado: {flag.threshold}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Respostas
          </TabsTrigger>
          <TabsTrigger value="decision" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Decisão
          </TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Strengths and weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-success/5 border border-success/20 rounded-xl p-4"
            >
              <h4 className="font-semibold text-success flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                Pontos Fortes
              </h4>
              <div className="space-y-3">
                {strengths.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <Badge variant="outline" className="text-success">
                        {item.score}%
                      </Badge>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weaknesses */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4"
            >
              <h4 className="font-semibold text-amber-500 flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5" />
                Áreas de Desenvolvimento
              </h4>
              <div className="space-y-3">
                {weaknesses.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <Badge variant="outline" className="text-amber-500">
                        {item.score}%
                      </Badge>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* All competencies */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 border"
          >
            <h4 className="font-semibold text-foreground mb-4">
              Todas as Competências
            </h4>
            <div className="space-y-3">
              {competencyEntries.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        item.score >= 70
                          ? 'text-success'
                          : item.score >= 50
                          ? 'text-amber-500'
                          : 'text-destructive'
                      )}
                    >
                      {item.score}%
                    </span>
                  </div>
                  <Progress
                    value={item.score}
                    className={cn(
                      'h-2',
                      item.score >= 70
                        ? '[&>div]:bg-success'
                        : item.score >= 50
                        ? '[&>div]:bg-amber-500'
                        : '[&>div]:bg-destructive'
                    )}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Analysis */}
          {result.aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 border"
            >
              <h4 className="font-semibold text-foreground mb-3">
                Análise da IA
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.aiAnalysis.summary}
              </p>
            </motion.div>
          )}
        </TabsContent>

        {/* Responses tab */}
        <TabsContent value="responses">
          <ResponseAnalysis
            questions={questions}
            responses={responses}
            onAdjustScore={onAdjustScore}
          />
        </TabsContent>

        {/* Decision tab */}
        <TabsContent value="decision">
          <RecruiterDecision
            currentDecision={result.recruiterDecision}
            aiRecommendation={result.aiRecommendation}
            overallScore={result.overallScore}
            recruiterNotes={result.recruiterNotes}
            onDecision={onDecision}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

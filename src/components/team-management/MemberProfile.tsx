/**
 * MemberProfile
 * PRD-055: Perfil detalhado de um colaborador com dados Gauge-Pro.
 * Enriched: header redesenhado + 4 tabs (Visão Geral, Competências, IA, Respostas)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pencil,
  RefreshCw,
  TrendingUp,
  LineChart,
  Calendar,
  Mail,
  Building2,
  Briefcase,
  Brain,
  Phone,
  ShieldCheck,
  BarChart3,
  Radar,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GaugeStatusBadge from './GaugeStatusBadge';
import { GaugeProRadarChart } from '@/components/corporate-tests/GaugeProRadarChart';
import { DimensionBarsGaugePro } from '@/components/corporate-tests/DimensionBarsGaugePro';
import { ArchetypeCard } from '@/components/corporate-tests/ArchetypeCard';
import { TopStrengthsDev } from '@/components/corporate-tests/TopStrengthsDev';
import { CompetencyRadarChart } from '@/components/corporate-tests/CompetencyRadarChart';
import { EmotionalFactorsCard } from '@/components/corporate-tests/EmotionalFactorsCard';
import { RiskScoreCard } from '@/components/corporate-tests/RiskScoreCard';
import { FitScoreDisplay } from '@/components/corporate-tests/FitScoreDisplay';
import { AIRecommendationsTab } from '@/components/corporate-tests/AIRecommendationsTab';
import { PracticalAnalysisCard } from '@/components/aiAnalysis/PracticalAnalysisCard';
import { TechnicalAnalysisCard } from '@/components/aiAnalysis/TechnicalAnalysisCard';
import { GaugeProResponsesCard } from '@/components/gaugePro/GaugeProResponsesCard';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';
import { calculateFitScore, classifyFitScore } from '@/utils/fitScore';
import type { TeamMember, Department, Position } from '@/types/teamManagement';
import type { DimensionScores, GaugeProAssessment, GaugeProResult, GaugeProDimension } from '@/types/gaugePro';
import type { CompanyTestResult } from '@/types/companyTest';

interface MemberProfileProps {
  member: TeamMember;
  department?: Department;
  position?: Position;
  testHistory?: Array<{
    id: string;
    scores: DimensionScores;
    archetype: string;
    completedAt: string;
  }>;
  candidateId?: string;
  gaugeProAssessment?: GaugeProAssessment;
  gaugeProResult?: GaugeProResult;
  testWeights?: Record<GaugeProDimension, number>;
  onEdit: () => void;
  onScheduleRetest: () => void;
  onViewDevelopment: () => void;
  onViewEvolution: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.length >= 3 ? `***${digits.slice(-3)}` : '***';
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function MemberProfile({
  member,
  department,
  position,
  testHistory = [],
  candidateId,
  gaugeProAssessment,
  gaugeProResult,
  testWeights,
  onEdit,
  onScheduleRetest,
  onViewDevelopment,
  onViewEvolution,
}: MemberProfileProps) {
  const { user } = useAuth();

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isMapped = member.gaugeStatus === 'mapped' && member.gaugeScores;

  // Resolve full archetype profile
  const archetypeProfile = gaugeProResult?.archetype
    ?? ARCHETYPE_PROFILES.find(
      (p) => p.name === member.archetype || p.id === member.archetype
    );

  // Prefer gaugeProResult.finalScores for precision
  const scores = gaugeProResult?.finalScores ?? member.gaugeScores;

  // Calculate fit score from test weights
  const fitScore = scores && testWeights
    ? calculateFitScore(scores, testWeights)
    : undefined;
  const fitClassification = fitScore !== undefined
    ? classifyFitScore(fitScore)
    : undefined;

  const strengths = gaugeProResult?.strengths ?? [];
  const developmentAreas = gaugeProResult?.developmentAreas ?? [];

  // Build CompanyTestResult-like object for AIRecommendationsTab
  const aiResult: CompanyTestResult | undefined =
    scores && archetypeProfile && candidateId
      ? {
          id: gaugeProResult?.id ?? '',
          testId: '',
          candidateId,
          candidateName: member.name,
          candidateEmail: member.email,
          invitationId: '',
          scores,
          archetype: archetypeProfile,
          primaryDimension: gaugeProResult?.primaryDimension ?? 'D1',
          secondaryDimension: gaugeProResult?.secondaryDimension ?? 'D2',
          strengths,
          developmentAreas,
          fitScore,
          fitClassification,
          completedAt: gaugeProResult?.generatedAt ?? member.lastTestDate ?? '',
        }
      : undefined;

  return (
    <div className="space-y-6">
      {/* ── Header Hero Card ──────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 shrink-0 mx-auto sm:mx-0">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              {/* Row 1: Name + badges */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold">{member.name}</h2>
                <GaugeStatusBadge status={member.gaugeStatus} />
                {!member.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inativo
                  </Badge>
                )}
                {archetypeProfile && (
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                    <Brain className="h-3 w-3 mr-1" />
                    {archetypeProfile.name}
                  </Badge>
                )}
              </div>

              {/* Row 2: Contact info */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </span>
                {member.cpf && (
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    CPF: {maskCpf(member.cpf)}
                  </span>
                )}
                {member.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhone(member.phone)}
                  </span>
                )}
              </div>

              {/* Row 3: Org info */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {department && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {department.name}
                  </span>
                )}
                {position && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {position.title}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Admissão: {formatDate(member.hireDate)}
                </span>
              </div>

              {/* Row 4: Metrics summary (only when mapped) */}
              {isMapped && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                  {fitScore !== undefined && fitClassification && (
                    <FitScoreDisplay score={fitScore} classification={fitClassification} compact />
                  )}
                  {member.lastTestDate && (
                    <span className="text-xs text-muted-foreground">
                      Último teste: {formatDate(member.lastTestDate)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={onScheduleRetest}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Agendar Reteste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
          onClick={onViewDevelopment}
        >
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Plano de Desenvolvimento</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Objetivos, metas e acompanhamento de crescimento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
          onClick={onViewEvolution}
        >
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Linha do Tempo de Evolução</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Histórico de testes, anotações e marcos profissionais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs (only when mapped) ────────────────────────────────────── */}
      {isMapped && scores ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="competencias" className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              <span className="hidden sm:inline">Competências</span>
            </TabsTrigger>
            <TabsTrigger value="ia" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="respostas" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Respostas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Perfil Gauge-Pro D1–D5</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <GaugeProRadarChart
                    scores={scores}
                    idealWeights={testWeights}
                    candidateName={member.name}
                    size="lg"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Scores por Dimensão</CardTitle>
                </CardHeader>
                <CardContent>
                  <DimensionBarsGaugePro scores={scores} />
                </CardContent>
              </Card>
            </div>

            {archetypeProfile && <ArchetypeCard archetype={archetypeProfile} />}

            {(strengths.length > 0 || developmentAreas.length > 0) && (
              <TopStrengthsDev strengths={strengths} developmentAreas={developmentAreas} />
            )}
          </TabsContent>

          {/* Tab 2: Competências */}
          <TabsContent value="competencias" className="space-y-6">
            <CompetencyRadarChart scores={scores} />
            <div className="grid gap-6 lg:grid-cols-2">
              <EmotionalFactorsCard scores={scores} />
              <RiskScoreCard scores={scores} fitScore={fitScore} />
            </div>
            {fitScore !== undefined && fitClassification && (
              <FitScoreDisplay score={fitScore} classification={fitClassification} />
            )}
          </TabsContent>

          {/* Tab 3: IA */}
          <TabsContent value="ia" className="space-y-6">
            {user?.type === 'admin' && candidateId && (
              <TechnicalAnalysisCard
                candidateId={candidateId}
                candidateName={member.name}
                gaugeProResult={gaugeProResult}
              />
            )}
            {candidateId && (
              <PracticalAnalysisCard
                candidateId={candidateId}
                candidateName={member.name}
              />
            )}
            {aiResult && <AIRecommendationsTab result={aiResult} />}
            {!candidateId && !aiResult && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-medium">Análise IA indisponível</p>
                  <p className="text-xs mt-1">
                    A análise de inteligência artificial requer vínculo com um perfil de candidato.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 4: Respostas */}
          <TabsContent value="respostas" className="space-y-6">
            {gaugeProAssessment && gaugeProResult && gaugeProAssessment.phase === 'completed' ? (
              <GaugeProResponsesCard
                assessment={gaugeProAssessment}
                result={gaugeProResult}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-medium">Nenhuma resposta disponível</p>
                  <p className="text-xs mt-1">
                    O teste não foi concluído ou os dados de resposta não estão disponíveis.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Test History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Testes</CardTitle>
              </CardHeader>
              <CardContent>
                {testHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Brain className="h-10 w-10 mb-3 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Nenhum teste realizado</p>
                    <p className="text-xs mt-1">
                      O colaborador ainda não completou nenhuma avaliação Gauge-Pro.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Arquétipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm">
                            {formatDate(entry.completedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {entry.archetype}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* ── Unmapped State ───────────────────────────────────────────── */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Brain className="h-12 w-12 mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground">
              Colaborador sem Mapeamento
            </h3>
            <p className="text-sm mt-2 text-center max-w-md">
              Este colaborador ainda não completou a avaliação Gauge-Pro.
              Envie um teste para gerar o perfil comportamental completo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

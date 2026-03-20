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
  ChevronDown,
  ChevronUp,
  Bot,
  Clock,
  Loader2,
} from 'lucide-react';
import { Fragment, useState, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
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
import { GaugeProResponsesCard } from '@/components/gaugePro/GaugeProResponsesCard';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadAllAnalysesFromSupabase, loadAllAnalysesByResultIds, saveAnalysisResult } from '@/lib/aiAgent/storageService';
import { useToast } from '@/hooks/use-toast';
import { renderAnalysisContent } from '@/lib/renderAnalysisContent';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';
import { calculateFitScore, classifyFitScore } from '@/utils/fitScore';
import type { TeamMember, Department, Position, TestHistoryEntry } from '@/types/teamManagement';
import type { DimensionScores, GaugeProAssessment, GaugeProResult, GaugeProDimension } from '@/types/gaugePro';
import type { CompanyTestResult } from '@/types/companyTest';

const DIMENSION_LABELS: Record<string, string> = {
  D1: 'Dominância',
  D2: 'Influência',
  D3: 'Estabilidade',
  D4: 'Conformidade',
  D5: 'Resiliência',
};

interface MemberProfileProps {
  member: TeamMember;
  department?: Department;
  position?: Position;
  testHistory?: TestHistoryEntry[];
  selectedTestId?: string | null;
  onSelectTest?: (testId: string) => void;
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

function formatAnalysisDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function AllAnalysesAccordion({
  candidateId,
  memberId,
  memberName,
  testHistory,
}: {
  candidateId?: string;
  memberId?: string;
  memberName?: string;
  testHistory: TestHistoryEntry[];
}) {
  const testResultIds = testHistory.map(t => t.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  const { data: allAnalyses = [], isLoading } = useQuery({
    queryKey: ['ai-analyses-all', candidateId ?? memberId, testResultIds],
    queryFn: () => {
      if (candidateId) return loadAllAnalysesFromSupabase(candidateId);
      return loadAllAnalysesByResultIds(testResultIds);
    },
    enabled: !!candidateId || testResultIds.length > 0,
  });

  const handleGenerateAnalysis = useCallback(async (testResultId: string) => {
    const entry = testHistory.find(t => t.id === testResultId);
    if (!entry) return;

    setGeneratingForId(testResultId);
    try {
      const { loadAgentSettingsAsync, generateBothAnalyses } = await import('@/lib/aiAgent');
      const settings = await loadAgentSettingsAsync();

      if (!settings.agentEnabled || !settings.apiKey) {
        toast({ title: 'Agente IA desabilitado', description: 'Configure a API key nas configurações do admin.', variant: 'destructive' });
        return;
      }

      // Reconstruct minimal GaugeProResult from TestHistoryEntry
      const archetypeProfile = ARCHETYPE_PROFILES.find(p => p.id === entry.archetype || p.name === entry.archetype)
        ?? { id: entry.archetype, name: entry.archetype, description: '', strengths: [], developmentAreas: [], idealRoles: [], workStyle: '', communicationStyle: '' };

      const gaugeResult: GaugeProResult = {
        id: entry.id,
        assessmentId: '',
        candidateId: candidateId || '',
        part1Scores: entry.part1Scores ?? entry.scores,
        part2Scores: entry.part2Scores ?? entry.scores,
        finalScores: entry.scores,
        classifications: (entry.classifications ?? {}) as Record<GaugeProDimension, import('@/types/gaugePro').DimensionClassification>,
        archetype: archetypeProfile,
        primaryDimension: (entry.primaryDimension ?? 'D1') as GaugeProDimension,
        secondaryDimension: (entry.secondaryDimension ?? 'D2') as GaugeProDimension,
        strengths: entry.strengths ?? [],
        developmentAreas: entry.developmentAreas ?? [],
        careerRecommendations: entry.careerRecommendations ?? [],
        xpAwarded: entry.xpAwarded ?? 0,
        badgeAwarded: entry.badgeAwarded ?? '',
        generatedAt: entry.completedAt,
      };

      const name = memberName || 'Colaborador';
      const analysisResult = await generateBothAnalyses(gaugeResult, name, settings);

      const hasValid =
        (analysisResult.practical && analysisResult.practical.status !== 'error') ||
        (analysisResult.technical && analysisResult.technical.status !== 'error');

      if (hasValid) {
        if (!candidateId && memberId) {
          analysisResult.teamMemberId = memberId;
        }
        saveAnalysisResult(analysisResult);
        queryClient.invalidateQueries({ queryKey: ['ai-analyses-all'] });
        toast({ title: 'Análise IA gerada', description: 'A análise foi gerada e salva com sucesso.' });
      } else {
        toast({ title: 'Erro na geração', description: 'A IA não conseguiu gerar uma análise válida.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('[AllAnalysesAccordion] generate error:', err);
      toast({ title: 'Erro ao gerar análise', description: 'Tente novamente mais tarde.', variant: 'destructive' });
    } finally {
      setGeneratingForId(null);
    }
  }, [testHistory, candidateId, memberId, memberName, queryClient, toast]);

  // Merge: show analyses that exist + tests without analysis
  const testDates = new Map(testHistory.map((t) => [t.id, t.completedAt]));
  const analysisTestIds = new Set(allAnalyses.map((a) => a.testResultId));

  // All items: analyses first (ordered by date desc), then tests without analysis
  const items = [
    ...allAnalyses.map((a) => ({
      testResultId: a.testResultId,
      date: testDates.get(a.testResultId) ?? a.generatedAt,
      practical: a.practical,
      technical: a.technical,
      generatedAt: a.generatedAt,
      hasAnalysis: true as const,
    })),
    ...testHistory
      .filter((t) => !analysisTestIds.has(t.id))
      .map((t) => ({
        testResultId: t.id,
        date: t.completedAt,
        practical: undefined,
        technical: undefined,
        generatedAt: undefined,
        hasAnalysis: false as const,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestTestId = testHistory.length > 0
    ? [...testHistory].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].id
    : undefined;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Sparkles className="h-6 w-6 animate-pulse text-muted-foreground/40 mr-2" />
          <span className="text-sm text-muted-foreground">Carregando análises...</span>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Sparkles className="h-10 w-10 mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium">Nenhuma análise disponível</p>
          <p className="text-xs mt-1">As análises são geradas automaticamente ao finalizar um teste.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={items[0]?.testResultId}
      className="space-y-2"
    >
      {items.map((item) => {
        const isLatest = item.testResultId === latestTestId;
        return (
          <AccordionItem
            key={item.testResultId}
            value={item.testResultId}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3 flex-1">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm">{formatDate(item.date)}</span>
                {isLatest && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    Atual
                  </Badge>
                )}
                {!item.hasAnalysis && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                    Sem análise
                  </Badge>
                )}
              </div>
              {item.generatedAt && (
                <div className="flex items-center gap-1.5 mr-2 text-[11px] text-muted-foreground shrink-0">
                  <Bot className="h-3 w-3" />
                  <span>Gerado por IA</span>
                  <Clock className="h-3 w-3 ml-1" />
                  <span>{formatAnalysisDate(item.generatedAt)}</span>
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {item.hasAnalysis ? (
                <div className="space-y-4">
                  {item.practical && item.practical.status !== 'error' && (
                    <div>
                      <div className="max-w-none max-h-[520px] overflow-y-auto pr-3 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {renderAnalysisContent(item.practical.content)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma análise gerada para este teste</p>
                  {generatingForId === item.testResultId ? (
                    <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando análise IA...
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      onClick={() => handleGenerateAnalysis(item.testResultId)}
                      disabled={generatingForId !== null}
                    >
                      <Sparkles className="h-4 w-4" />
                      Gerar Análise IA
                    </Button>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function MemberProfile({
  member,
  department,
  position,
  testHistory = [],
  selectedTestId,
  onSelectTest,
  candidateId,
  gaugeProAssessment,
  gaugeProResult,
  testWeights,
  onEdit,
  onScheduleRetest,
  onViewDevelopment,
  onViewEvolution,
}: MemberProfileProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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
    scores && archetypeProfile
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

      {/* ── Test Timeline (only when 2+ tests) ────────────────────────── */}
      {testHistory.length > 1 && onSelectTest && (
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Histórico de Avaliações</p>
            <div className="relative flex items-center">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border" />
              {/* Dots */}
              <div className="relative flex justify-between w-full">
                {[...testHistory].reverse().map((entry, idx) => {
                  const isSelected = selectedTestId
                    ? entry.id === selectedTestId
                    : idx === testHistory.length - 1;
                  const isLatest = idx === testHistory.length - 1;
                  return (
                    <Tooltip key={entry.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onSelectTest(entry.id)}
                          className="flex flex-col items-center gap-1.5 group"
                        >
                          <div
                            className={`relative z-10 rounded-full transition-all ${
                              isSelected
                                ? 'w-4 h-4 bg-primary ring-2 ring-primary/30'
                                : 'w-3 h-3 bg-muted-foreground/40 group-hover:bg-primary/60'
                            }`}
                          />
                          <span className={`text-[10px] leading-tight ${
                            isSelected ? 'text-primary font-semibold' : 'text-muted-foreground'
                          }`}>
                            {formatDate(entry.completedAt)}
                          </span>
                          {isLatest && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                              Atual
                            </Badge>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>{entry.archetype}</p>
                        <p className="text-muted-foreground">
                          {formatDate(entry.completedAt)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tabs (only when mapped) ────────────────────────────────────── */}
      {isMapped && scores ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="competencias" className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              <span className="hidden sm:inline">Competências</span>
            </TabsTrigger>
            <TabsTrigger value="arquetipo" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Arquétipo</span>
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

          {/* Tab 3: Arquétipo */}
          <TabsContent value="arquetipo" className="space-y-6">
            {aiResult ? (
              <AIRecommendationsTab result={aiResult} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Brain className="h-10 w-10 mb-3 text-muted-foreground/40" />
                  <p className="text-sm font-medium">Dados de arquétipo indisponíveis</p>
                  <p className="text-xs mt-1">O colaborador precisa completar o teste comportamental.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 4: IA */}
          <TabsContent value="ia" className="space-y-6">
            <AllAnalysesAccordion
              candidateId={candidateId}
              memberId={member.id}
              memberName={member.name}
              testHistory={testHistory}
            />
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

            {/* Test History — Expandable */}
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
                        <TableHead className="w-8" />
                        <TableHead>Data</TableHead>
                        <TableHead>Arquétipo</TableHead>
                        <TableHead>Fit Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testHistory.map((entry) => {
                        const isExpanded = expandedRowId === entry.id;
                        const isActive = selectedTestId
                          ? entry.id === selectedTestId
                          : entry.id === testHistory[0]?.id;
                        const entryFitScore = entry.scores && testWeights
                          ? calculateFitScore(entry.scores, testWeights)
                          : undefined;
                        const entryFitClass = entryFitScore !== undefined
                          ? classifyFitScore(entryFitScore)
                          : undefined;

                        return (
                          <Fragment key={entry.id}>
                            <TableRow
                              className={`cursor-pointer transition-colors ${
                                isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => {
                                setExpandedRowId(isExpanded ? null : entry.id);
                                if (onSelectTest) onSelectTest(entry.id);
                              }}
                            >
                              <TableCell className="w-8 px-2">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {formatDate(entry.completedAt)}
                                {entry.id === testHistory[0]?.id && (
                                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                                    Mais recente
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.archetype}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {entryFitScore !== undefined && entryFitClass ? (
                                  <FitScoreDisplay score={entryFitScore} classification={entryFitClass} compact />
                                ) : (
                                  <span className="text-xs text-muted-foreground">–</span>
                                )}
                              </TableCell>
                            </TableRow>

                            {/* Expanded details */}
                            {isExpanded && (
                              <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableCell colSpan={4} className="p-4">
                                  <div className="space-y-4">
                                    {/* D1-D5 scores */}
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-2">Dimensões</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                        {(['D1', 'D2', 'D3', 'D4', 'D5'] as const).map((dim) => {
                                          const val = entry.scores?.[dim] ?? 0;
                                          return (
                                            <div key={dim} className="space-y-1">
                                              <div className="flex justify-between text-xs">
                                                <span className="font-medium">{dim}</span>
                                                <span className="text-muted-foreground">{Math.round(val)}</span>
                                              </div>
                                              <Progress value={val} className="h-1.5" />
                                              <p className="text-[10px] text-muted-foreground">{DIMENSION_LABELS[dim]}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Strengths & Development Areas */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {entry.strengths && entry.strengths.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Forças</p>
                                          <div className="flex flex-wrap gap-1">
                                            {entry.strengths.map((s) => (
                                              <Badge key={s} variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                {s}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {entry.developmentAreas && entry.developmentAreas.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Áreas de Desenvolvimento</p>
                                          <div className="flex flex-wrap gap-1">
                                            {entry.developmentAreas.map((d) => (
                                              <Badge key={d} variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                {d}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
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

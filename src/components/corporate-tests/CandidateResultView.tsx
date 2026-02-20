/**
 * Candidate Result View
 * PRD-053: Visualização completa do resultado com 4 abas
 */

import { BarChart3, Radar, Sparkles, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GaugeProRadarChart } from './GaugeProRadarChart';
import { DimensionBarsGaugePro } from './DimensionBarsGaugePro';
import { ArchetypeCard } from './ArchetypeCard';
import { TopStrengthsDev } from './TopStrengthsDev';
import { FitScoreDisplay } from './FitScoreDisplay';
import { CompetencyRadarChart } from './CompetencyRadarChart';
import { EmotionalFactorsCard } from './EmotionalFactorsCard';
import { RiskScoreCard } from './RiskScoreCard';
import { AIRecommendationsTab } from './AIRecommendationsTab';
import { TestResponsesTab } from './TestResponsesTab';
import { TechnicalAnalysisCard } from '@/components/aiAnalysis/TechnicalAnalysisCard';
import { PracticalAnalysisCard } from '@/components/aiAnalysis/PracticalAnalysisCard';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { CompanyTestResult, CompanyTest } from '@/types/companyTest';

interface CandidateResultViewProps {
  result: CompanyTestResult;
  test: CompanyTest;
}

export function CandidateResultView({ result, test }: CandidateResultViewProps) {
  const initials = result.candidateName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header — persistent above tabs */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{result.candidateName}</h2>
              <p className="text-sm text-muted-foreground">{result.candidateEmail}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{result.archetype.name}</Badge>
                <Badge variant="secondary" className="text-xs">
                  {DIMENSION_SHORT_NAMES[result.primaryDimension]} + {DIMENSION_SHORT_NAMES[result.secondaryDimension]}
                </Badge>
                {result.shortlisted && (
                  <Badge className="bg-amber-100 text-amber-700">Shortlist</Badge>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              Concluído em<br />
              {new Date(result.completedAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fit Score — persistent above tabs */}
      {result.fitScore !== undefined && result.fitClassification && (
        <FitScoreDisplay score={result.fitScore} classification={result.fitClassification} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="competencias" className="flex items-center gap-2">
            <Radar className="w-4 h-4" />
            <span className="hidden sm:inline">Competências</span>
          </TabsTrigger>
          <TabsTrigger value="ia" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="respostas" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Respostas</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Perfil Gauge-Pro D1-D5</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <GaugeProRadarChart
                  scores={result.scores}
                  idealWeights={test.weights}
                  candidateName={result.candidateName}
                  size="lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scores por Dimensão</CardTitle>
              </CardHeader>
              <CardContent>
                <DimensionBarsGaugePro scores={result.scores} />
              </CardContent>
            </Card>
          </div>

          <ArchetypeCard archetype={result.archetype} />

          <TopStrengthsDev
            strengths={result.strengths}
            developmentAreas={result.developmentAreas}
          />
        </TabsContent>

        {/* Tab 2: Competências */}
        <TabsContent value="competencias" className="space-y-6">
          <CompetencyRadarChart scores={result.scores} />

          <div className="grid gap-6 lg:grid-cols-2">
            <EmotionalFactorsCard scores={result.scores} />
            <RiskScoreCard scores={result.scores} fitScore={result.fitScore} />
          </div>
        </TabsContent>

        {/* Tab 3: IA & Recomendações */}
        <TabsContent value="ia" className="space-y-6">
          <TechnicalAnalysisCard
            candidateId={result.candidateId}
            candidateName={result.candidateName}
          />
          <PracticalAnalysisCard
            candidateId={result.candidateId}
            candidateName={result.candidateName}
          />
          <AIRecommendationsTab result={result} />
        </TabsContent>

        {/* Tab 4: Respostas */}
        <TabsContent value="respostas">
          <TestResponsesTab candidateId={result.candidateId} scores={result.scores} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

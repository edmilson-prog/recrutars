/**
 * Candidate Result View
 * PRD-053: Visualização completa do resultado
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GaugeProRadarChart } from './GaugeProRadarChart';
import { DimensionBarsGaugePro } from './DimensionBarsGaugePro';
import { ArchetypeCard } from './ArchetypeCard';
import { AIAnalysisSection } from './AIAnalysisSection';
import { TopStrengthsDev } from './TopStrengthsDev';
import { FitScoreDisplay } from './FitScoreDisplay';
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
      {/* Header */}
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

      {/* Fit Score */}
      {result.fitScore !== undefined && result.fitClassification && (
        <FitScoreDisplay score={result.fitScore} classification={result.fitClassification} />
      )}

      {/* Radar + Bars */}
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

      {/* Archetype */}
      <ArchetypeCard archetype={result.archetype} />

      {/* Strengths & Dev Areas */}
      <TopStrengthsDev
        strengths={result.strengths}
        developmentAreas={result.developmentAreas}
      />

      {/* AI Analysis */}
      {result.aiAnalysis && (
        <AIAnalysisSection analysis={result.aiAnalysis} defaultExpanded />
      )}
    </div>
  );
}

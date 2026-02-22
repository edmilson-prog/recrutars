/**
 * Gauge-Pro Result Page
 * PRD-050: Display archetype, radar chart, strengths, careers
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Star,
  TrendingUp,
  Briefcase,
  ArrowLeft,
  Award,
  MessageSquare,
  Users,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';
import { TEST_CONFIG } from '@/data/testConfig';
import { DIMENSION_NAMES, DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProResult as GaugeProResultType, GaugeProDimension } from '@/types/gaugePro';
import { useEffect, useState } from 'react';
import { useGaugeProResultByCandidate } from '@/hooks/useGaugeProQuery';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { PracticalAnalysisCard, TechnicalAnalysisCard } from '@/components/aiAnalysis';

const DIMENSION_COLORS: Record<GaugeProDimension, string> = {
  D1: '#ef4444',
  D2: '#f59e0b',
  D3: '#22c55e',
  D4: '#3b82f6',
  D5: '#8b5cf6',
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-green-100 text-green-700',
};

export default function GaugeProResult() {
  const { user, currentCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const analysisGenerating = !!(location.state as { analysisGenerating?: boolean } | null)?.analysisGenerating;
  const [result, setResult] = useState<GaugeProResultType | null>(null);

  const candidateId = currentCandidate?.id || user?.id || '';
  const resultKey = GAUGE_PRO_CONFIG.storageKeys.result(candidateId);

  // Try Supabase first
  const { data: supabaseResult } = useGaugeProResultByCandidate(candidateId);

  const aiAnalysis = useAIAnalysis({
    candidateId,
    candidateName: currentCandidate?.name || user?.email || 'Candidato',
  });

  const hasAnalysis = !!(aiAnalysis.practicalAnalysis || aiAnalysis.technicalAnalysis);

  useEffect(() => {
    // Supabase result takes priority
    if (supabaseResult) {
      setResult(supabaseResult);
      return;
    }
    // Fallback to localStorage
    const saved = localStorage.getItem(resultKey);
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, [supabaseResult, resultKey]);

  if (!result) {
    return (
      <DashboardLayout userType="candidate">
        <div className="p-6 text-center">
          <p className="text-gray-600">Nenhum resultado encontrado.</p>
          <Button onClick={() => navigate('/candidato/gauge-pro')} className="mt-4">
            Iniciar Avaliação
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const dimensions: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

  return (
    <DashboardLayout userType="candidate">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/candidato/teste-comportamental')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </div>

        {/* Result Banner */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-slate-300 uppercase tracking-wide">Seu Perfil Comportamental</p>
                <h1 className="text-2xl md:text-3xl font-bold">{result.archetype.name}</h1>
                <p className="text-slate-300 max-w-lg">{result.archetype.description}</p>
              </div>
              <div className="shrink-0 w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                +{result.xpAwarded} XP
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Award className="w-3 h-3 mr-1" /> {TEST_CONFIG.badgeName}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Suas 5 Dimensões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimensions.map(dim => {
              const score = result.finalScores[dim];
              const classification = result.classifications[dim];
              return (
                <div key={dim} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {DIMENSION_SHORT_NAMES[dim]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {DIMENSION_NAMES[dim]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: DIMENSION_COLORS[dim] }}>
                        {score}%
                      </span>
                      <Badge variant="secondary" className={`text-xs ${CLASSIFICATION_COLORS[classification]}`}>
                        {CLASSIFICATION_LABELS[classification]}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${score}%`,
                        backgroundColor: DIMENSION_COLORS[dim],
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <Separator className="my-4" />

            {/* Part 1 vs Part 2 comparison */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div className="p-3 bg-cyan-50 rounded-lg">
                <p className="font-medium text-cyan-800">Parte 1 — Palavras</p>
                <p className="text-cyan-600 text-xs mt-1">Peso: 60%</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="font-medium text-indigo-800">Parte 2 — Cenários</p>
                <p className="text-indigo-600 text-xs mt-1">Peso: 40%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Development */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">●</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Áreas de Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.developmentAreas.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-0.5">●</span>
                    {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Work & Communication Style */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Estilo de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{result.archetype.workStyle}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                Estilo de Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{result.archetype.communicationStyle}</p>
            </CardContent>
          </Card>
        </div>

        {/* Career Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              Carreiras Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.careerRecommendations.map((career, i) => (
                <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                  {career}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Cards - PRD-051 (rendered only when analysis exists so hooks load fresh data) */}
        {hasAnalysis && (
          <>
            <PracticalAnalysisCard
              candidateId={candidateId}
              candidateName={currentCandidate?.name || user?.email || 'Candidato'}
            />
            <TechnicalAnalysisCard
              candidateId={candidateId}
              candidateName={currentCandidate?.name || user?.email || 'Candidato'}
            />
          </>
        )}

        {/* AI Analysis Indicator */}
        {!hasAnalysis && (
          <div className="flex flex-col items-center gap-2 py-2">
            {(aiAnalysis.isGenerating || analysisGenerating) ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando análise inteligente...</span>
              </div>
            ) : (
              <>
                {aiAnalysis.error && (
                  <p className="text-xs text-destructive text-center max-w-sm">
                    {aiAnalysis.error}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Análise inteligente</span>
                  <button
                    onClick={() => result && aiAnalysis.generateAnalyses(result)}
                    className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Gerar agora
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-2 pb-6">
          <Button variant="outline" onClick={() => navigate('/candidato/teste-comportamental')}>
            Voltar aos Testes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

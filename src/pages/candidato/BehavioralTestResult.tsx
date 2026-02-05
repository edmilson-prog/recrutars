/**
 * BehavioralTestResult Page
 * PRD-047: Teste Geral do Candidato
 *
 * Página de resultado detalhado do teste comportamental
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ResultBanner,
  DimensionRadar,
  DimensionBars,
  CategoryBars,
  InsightsSection,
  StrengthsAndAreas,
  CareerRecommendations,
} from '@/components/assessment';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { mockBehavioralResults } from '@/data/behavioralAssessmentData';
import { BEHAVIORAL_TEST_CONFIG } from '@/data/behavioralAssessmentData';
import { toast } from 'sonner';
import type { BehavioralResult } from '@/types/assessment';

export default function BehavioralTestResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id || '';

  const [result, setResult] = useState<BehavioralResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar resultado
  useEffect(() => {
    // Tentar pegar do state (após completar teste)
    const stateResultId = (location.state as { resultId?: string })?.resultId;

    // Buscar resultado do candidato
    const candidateResult = mockBehavioralResults.find(
      (r) => r.candidateId === candidateId || r.id === stateResultId
    );

    if (candidateResult) {
      setResult(candidateResult);
    }

    setLoading(false);
  }, [candidateId, location.state]);

  // Handlers
  const handleDownloadPDF = () => {
    toast.success('Download iniciado!', {
      description: 'O PDF será enviado ao seu email em instantes.',
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado!', {
      description: 'Compartilhe seu perfil com recrutadores.',
    });
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="max-w-3xl mx-auto py-20 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </DashboardLayout>
    );
  }

  // No result state
  if (!result) {
    return (
      <DashboardLayout userType="candidate">
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Nenhum resultado encontrado
          </h1>
          <p className="text-muted-foreground mb-8">
            Você ainda não completou a avaliação comportamental. Complete o teste
            para visualizar seu perfil detalhado.
          </p>
          <Button asChild className="gradient-primary">
            <Link to="/candidato/teste-comportamental">
              Fazer o Teste
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/candidato')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Result Banner */}
        <ResultBanner
          overallScore={result.overallScore}
          xpAwarded={result.xpAwarded}
          badgeName="Autoconhecimento"
        />

        {/* Main content with tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Dimension Radar and Bars */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 shadow-soft"
              >
                <h3 className="font-semibold text-foreground mb-4">
                  Perfil por Dimensão
                </h3>
                <DimensionRadar
                  personalityScore={result.personalityScore}
                  characterScore={result.characterScore}
                  competencyScore={result.competencyScore}
                  size="md"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 shadow-soft"
              >
                <h3 className="font-semibold text-foreground mb-4">
                  Scores
                </h3>
                <DimensionBars
                  personalityScore={result.personalityScore}
                  characterScore={result.characterScore}
                  competencyScore={result.competencyScore}
                />
              </motion.div>
            </div>

            {/* Strengths and Areas */}
            <StrengthsAndAreas
              strengths={result.strengths}
              developmentAreas={result.developmentAreas}
            />

            {/* Red Flags (if any) */}
            {result.redFlags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
              >
                <h4 className="font-semibold text-amber-600 mb-2">
                  Pontos de Atenção
                </h4>
                <ul className="space-y-1">
                  {result.redFlags.map((flag) => (
                    <li
                      key={flag.categoryId}
                      className="text-sm text-muted-foreground"
                    >
                      <strong>{flag.categoryName}</strong>: {flag.description}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Insights */}
            <InsightsSection
              summary={result.summary}
              insights={result.insights}
            />

            {/* Category breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <h3 className="font-semibold text-foreground mb-4">
                Detalhamento por Categoria
              </h3>
              <CategoryBars
                categoryScores={result.categoryScores}
                strengths={result.strengths}
                developmentAreas={result.developmentAreas}
              />
            </motion.div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* Career recommendations */}
            <CareerRecommendations
              recommendations={result.careerRecommendations}
            />

            {/* Next steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <h3 className="font-semibold text-foreground mb-4">
                Próximos Passos
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      Complete seu perfil
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Adicione experiências e habilidades para um match mais preciso
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      Explore vagas recomendadas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vagas selecionadas com base no seu perfil comportamental
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      Desenvolva suas áreas de melhoria
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Invista em cursos e práticas para fortalecer pontos de desenvolvimento
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Retake info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted rounded-xl p-4 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Você poderá refazer o teste em{' '}
                <strong>{BEHAVIORAL_TEST_CONFIG.cooldownDays} dias</strong> para
                atualizar seu perfil.
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

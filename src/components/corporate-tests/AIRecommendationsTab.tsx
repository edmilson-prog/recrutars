/**
 * AI Recommendations Tab
 * Structured AI analysis with hiring, development, team and risk sections
 */

import { Sparkles, ThumbsUp, BookOpen, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateRiskAssessment } from '@/utils/riskScore';
import type { FitClassification } from '@/types/companyTest';
import type { CompanyTestResult } from '@/types/companyTest';

interface AIRecommendationsTabProps {
  result: CompanyTestResult;
}

function getHiringRecommendation(fitScore: number | undefined, classification: FitClassification | undefined) {
  if (!fitScore || !classification) return { text: 'Dados insuficientes para recomendação.', badge: 'Indeterminado', color: '#6b7280' };
  if (classification === 'excellent') return { text: 'Forte recomendação de contratação. O perfil do candidato demonstra alinhamento excepcional com os requisitos da vaga. As dimensões comportamentais indicam alta probabilidade de adaptação e performance.', badge: 'Recomendado', color: '#16a34a' };
  if (classification === 'good') return { text: 'Recomendação favorável com ressalvas. O candidato apresenta bom alinhamento geral, mas algumas dimensões podem requerer suporte inicial. Considerar onboarding estruturado.', badge: 'Favorável', color: '#2563eb' };
  if (classification === 'regular') return { text: 'Recomendação condicional. O perfil apresenta gaps significativos que podem impactar a performance. Avaliar se a posição permite desenvolvimento gradual nessas áreas.', badge: 'Condicional', color: '#ca8a04' };
  return { text: 'Não recomendado para esta posição específica. O desalinhamento entre o perfil e os requisitos é significativo. Considerar outras posições que melhor aproveitem as forças do candidato.', badge: 'Não Recomendado', color: '#dc2626' };
}

function getDevelopmentPlan(developmentAreas: string[], archetype: CompanyTestResult['archetype']) {
  const plans: Array<{ area: string; suggestion: string }> = [];
  for (const area of developmentAreas.slice(0, 4)) {
    const lower = area.toLowerCase();
    if (lower.includes('assertiv') || lower.includes('dominância')) {
      plans.push({ area, suggestion: 'Treinamentos de liderança situacional e comunicação assertiva. Exercícios de tomada de decisão rápida.' });
    } else if (lower.includes('sociab') || lower.includes('extroversão') || lower.includes('comunicação')) {
      plans.push({ area, suggestion: 'Workshops de apresentação e networking. Dinâmicas de grupo e projetos colaborativos.' });
    } else if (lower.includes('ritmo') || lower.includes('paciência') || lower.includes('constância')) {
      plans.push({ area, suggestion: 'Técnicas de mindfulness e gestão do estresse. Metodologias de planejamento e priorização.' });
    } else if (lower.includes('conform') || lower.includes('estrutura') || lower.includes('organização')) {
      plans.push({ area, suggestion: 'Treinamento em gestão de processos e qualidade. Uso de ferramentas de organização e checklists.' });
    } else if (lower.includes('relacional') || lower.includes('empatia') || lower.includes('colaboração')) {
      plans.push({ area, suggestion: 'Programas de mentoring e coaching. Atividades de team building e escuta ativa.' });
    } else {
      plans.push({ area, suggestion: `Programa de desenvolvimento focado em ${area.toLowerCase()} com acompanhamento periódico.` });
    }
  }
  if (plans.length === 0) {
    plans.push({ area: archetype.workStyle, suggestion: 'Manter e fortalecer os pontos positivos já demonstrados através de desafios progressivos.' });
  }
  return plans;
}

function getTeamPositioning(archetype: CompanyTestResult['archetype']) {
  return {
    workStyle: archetype.workStyle,
    communication: archetype.communicationStyle,
    idealRoles: archetype.idealRoles.slice(0, 3),
    teamTip: archetype.strengths.length > 0
      ? `Aproveitar suas forças em "${archetype.strengths[0].toLowerCase()}" para contribuições significativas ao time.`
      : 'Integrar gradualmente nas atividades do time, identificando pontos de contribuição natural.',
  };
}

export function AIRecommendationsTab({ result }: AIRecommendationsTabProps) {
  const hiring = getHiringRecommendation(result.fitScore, result.fitClassification);
  const devPlan = getDevelopmentPlan(result.developmentAreas, result.archetype);
  const team = getTeamPositioning(result.archetype);
  const risk = calculateRiskAssessment(result.scores, result.fitScore);

  return (
    <div className="space-y-6">
      {/* AI General Analysis */}
      {result.aiAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Análise Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {result.aiAnalysis}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hiring Recommendation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-blue-500" />
            Recomendação de Contratação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1"
            style={{ borderColor: hiring.color, color: hiring.color }}
          >
            {hiring.badge}
          </Badge>
          <p className="text-sm text-muted-foreground leading-relaxed">{hiring.text}</p>
        </CardContent>
      </Card>

      {/* Development Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-500" />
            Plano de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devPlan.map((item, i) => (
              <div key={i} className="border-l-2 border-green-200 pl-3">
                <p className="text-sm font-medium">{item.area}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Positioning */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" />
            Posicionamento em Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estilo de Trabalho</p>
              <p className="text-sm">{team.workStyle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Comunicação</p>
              <p className="text-sm">{team.communication}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Posições Ideais</p>
            <div className="flex flex-wrap gap-1.5">
              {team.idealRoles.map((role, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{role}</Badge>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">{team.teamTip}</p>
        </CardContent>
      </Card>

      {/* Risk Mitigation */}
      {risk.flags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Mitigação de Riscos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risk.flags.map((flag, i) => (
                <div key={i} className="border-l-2 border-amber-200 pl-3">
                  <p className="text-sm font-medium">{flag.description}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {flag.type === 'dimensao_baixa' && `Sugestão: Programas de desenvolvimento específicos para ${flag.dimension}. Considerar acompanhamento nos primeiros 90 dias.`}
                    {flag.type === 'instabilidade' && 'Sugestão: Avaliar estabilidade emocional em entrevista presencial. Considerar ambiente estruturado inicialmente.'}
                    {flag.type === 'fit_baixo' && 'Sugestão: Reavaliar adequação da posição ou considerar realocação para cargo com melhor alinhamento de perfil.'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

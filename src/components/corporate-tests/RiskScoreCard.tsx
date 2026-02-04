/**
 * Risk Score Card
 * Risk classification with flags and instability gap
 */

import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateRiskAssessment, RISK_CLASSIFICATION_CONFIG } from '@/utils/riskScore';
import type { RiskClassification } from '@/types/companyTest';
import type { DimensionScores } from '@/types/gaugePro';

interface RiskScoreCardProps {
  scores: DimensionScores;
  fitScore?: number;
}

const RISK_ICONS: Record<RiskClassification, React.ElementType> = {
  baixo: CheckCircle2,
  moderado: AlertCircle,
  alto: AlertTriangle,
  critico: XCircle,
};

export function RiskScoreCard({ scores, fitScore }: RiskScoreCardProps) {
  const risk = calculateRiskAssessment(scores, fitScore);
  const config = RISK_CLASSIFICATION_CONFIG[risk.classification];
  const Icon = RISK_ICONS[risk.classification];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Avaliação de Risco</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Classification badge */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: config.bgColor }}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: config.color }}>
              {config.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Score: {risk.overallScore}/100
            </p>
          </div>
        </div>

        {/* Instability gap */}
        <div className="text-sm">
          <span className="text-muted-foreground">Gap de Instabilidade: </span>
          <span className={`font-medium ${risk.instabilityGap > 40 ? 'text-amber-600' : 'text-foreground'}`}>
            {risk.instabilityGap} pontos
          </span>
        </div>

        {/* Flags */}
        {risk.flags.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Flags identificados
            </p>
            {risk.flags.map((flag, i) => {
              const flagConfig = RISK_CLASSIFICATION_CONFIG[flag.severity];
              return (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs px-1.5"
                    style={{ borderColor: flagConfig.color, color: flagConfig.color }}
                  >
                    {flagConfig.label}
                  </Badge>
                  <span className="text-muted-foreground">{flag.description}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum flag de risco identificado.</p>
        )}
      </CardContent>
    </Card>
  );
}

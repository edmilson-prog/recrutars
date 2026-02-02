/**
 * Match Opportunities Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Seção "Oportunidades de melhoria" com sugestões construtivas
 * Indica impacto potencial em % e se é acionável
 */

import { motion } from "framer-motion";
import {
  TrendingUp,
  Lightbulb,
  BookOpen,
  MapPin,
  Code2,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchOpportunity } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Ícones por categoria
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  skills: Code2,
  experience: GraduationCap,
  behavioral: BookOpen,
  location: MapPin,
  default: Lightbulb,
};

interface MatchOpportunitiesProps {
  opportunities: MatchOpportunity[];
  title?: string;
  maxItems?: number;
  animated?: boolean;
  showActions?: boolean;
  onActionClick?: (opportunity: MatchOpportunity) => void;
  className?: string;
}

export function MatchOpportunities({
  opportunities,
  title = "Oportunidades de melhoria",
  maxItems = 5,
  animated = true,
  showActions = false,
  onActionClick,
  className,
}: MatchOpportunitiesProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const displayedOpportunities = opportunities.slice(0, maxItems);

  if (displayedOpportunities.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedOpportunities.map((opportunity, index) => {
          const Icon =
            CATEGORY_ICONS[opportunity.category] || CATEGORY_ICONS.default;

          return (
            <motion.div
              key={opportunity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"
              initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{opportunity.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {opportunity.potentialIncrease > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    >
                      +{opportunity.potentialIncrease}% match
                    </Badge>
                  )}
                  {opportunity.actionable && (
                    <Badge variant="outline" className="text-xs">
                      Acionável
                    </Badge>
                  )}
                </div>
                {showActions && opportunity.actionable && onActionClick && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 h-auto p-0 text-cyan-600"
                    onClick={() => onActionClick(opportunity)}
                  >
                    Ver como melhorar →
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}

        {opportunities.length > maxItems && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{opportunities.length - maxItems} outras oportunidades
          </p>
        )}

        {/* Resumo do impacto total */}
        {displayedOpportunities.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Impacto potencial total:{" "}
              <span className="font-semibold text-green-600">
                +
                {displayedOpportunities.reduce(
                  (sum, o) => sum + o.potentialIncrease,
                  0
                )}
                %
              </span>{" "}
              no match score
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Versão compacta para cards de vagas
export function MatchOpportunitiesCompact({
  opportunities,
  maxItems = 2,
  className,
}: {
  opportunities: MatchOpportunity[];
  maxItems?: number;
  className?: string;
}) {
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cyan-500" />
        Oportunidades
      </h4>
      <ul className="space-y-1.5">
        {opportunities.slice(0, maxItems).map((opportunity) => (
          <li
            key={opportunity.id}
            className="flex items-start gap-2 text-sm"
          >
            <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <span className="text-foreground flex-1">{opportunity.text}</span>
            {opportunity.potentialIncrease > 0 && (
              <span className="text-xs text-green-600 font-medium shrink-0">
                +{opportunity.potentialIncrease}%
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Lista simples de oportunidades
export function MatchOpportunitiesList({
  opportunities,
  maxItems = 3,
  className,
}: {
  opportunities: MatchOpportunity[];
  maxItems?: number;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-1.5", className)}>
      {opportunities.slice(0, maxItems).map((opportunity) => (
        <li
          key={opportunity.id}
          className="flex items-start gap-2 text-sm"
        >
          <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <span className="text-foreground">{opportunity.text}</span>
        </li>
      ))}
    </ul>
  );
}

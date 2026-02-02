/**
 * Match Strengths Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Seção "Por que você combina" com pontos fortes do match
 * Cada ponto tem ícone indicativo e categoria associada
 */

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Award, Target, Users, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchStrength } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Ícones por categoria
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  skills: Target,
  experience: Award,
  behavioral: Brain,
  location: Users,
  default: Sparkles,
};

// Cores por impacto
const IMPACT_COLORS = {
  high: {
    bg: "bg-green-100 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
  },
  medium: {
    bg: "bg-yellow-100 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  low: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
  },
};

interface MatchStrengthsProps {
  strengths: MatchStrength[];
  title?: string;
  maxItems?: number;
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

export function MatchStrengths({
  strengths,
  title = "Por que você combina",
  maxItems = 5,
  animated = true,
  compact = false,
  className,
}: MatchStrengthsProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const displayedStrengths = strengths.slice(0, maxItems);

  if (displayedStrengths.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          {title}
        </h4>
        <ul className="space-y-1">
          {displayedStrengths.map((strength, index) => (
            <motion.li
              key={strength.id}
              className="flex items-start gap-2 text-sm"
              initial={shouldAnimate ? { opacity: 0, x: -10 } : {}}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-foreground">{strength.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedStrengths.map((strength, index) => {
          const Icon = CATEGORY_ICONS[strength.category] || CATEGORY_ICONS.default;
          const colors = IMPACT_COLORS[strength.impact];

          return (
            <motion.div
              key={strength.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                colors.bg,
                colors.border
              )}
              initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  "bg-background/50"
                )}
              >
                <Icon className={cn("w-4 h-4", colors.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{strength.text}</p>
                <span className="text-xs text-muted-foreground capitalize">
                  {strength.category === "skills"
                    ? "Skills Técnicas"
                    : strength.category === "experience"
                    ? "Experiência"
                    : strength.category === "behavioral"
                    ? "Perfil Comportamental"
                    : strength.category === "location"
                    ? "Localização"
                    : strength.category}
                </span>
              </div>
            </motion.div>
          );
        })}

        {strengths.length > maxItems && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{strengths.length - maxItems} outros pontos fortes
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Lista simples de pontos fortes (para uso inline)
export function MatchStrengthsList({
  strengths,
  maxItems = 3,
  className,
}: {
  strengths: MatchStrength[];
  maxItems?: number;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-1.5", className)}>
      {strengths.slice(0, maxItems).map((strength) => (
        <li
          key={strength.id}
          className="flex items-start gap-2 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <span className="text-foreground">{strength.text}</span>
        </li>
      ))}
    </ul>
  );
}

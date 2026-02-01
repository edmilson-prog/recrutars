/**
 * Behavioral Profile Legend Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Legenda explicativa das dimensões comportamentais com cores e descrições
 */

import { cn } from "@/lib/utils";
import type { BehavioralProfile, BehavioralDimension, BehavioralDimensionInfo } from "@/types/disc";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Informações completas de cada dimensão comportamental
const BEHAVIORAL_DIMENSIONS: Record<BehavioralDimension, BehavioralDimensionInfo> = {
  d: {
    key: "d",
    name: "D",
    fullName: "Dominância",
    description: "Pessoas com alto D são diretas, assertivas e orientadas a resultados. Gostam de desafios e tomam decisões rapidamente.",
    color: "bg-red-500",
    bgColor: "bg-red-100 dark:bg-red-950/30",
    traits: ["Assertivo", "Competitivo", "Direto", "Decisivo", "Orientado a resultados"],
  },
  i: {
    key: "i",
    name: "I",
    fullName: "Influência",
    description: "Pessoas com alto I são sociáveis, entusiastas e persuasivas. Gostam de interagir com pessoas e criar conexões.",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
    traits: ["Sociável", "Entusiasta", "Persuasivo", "Otimista", "Colaborativo"],
  },
  s: {
    key: "s",
    name: "S",
    fullName: "Estabilidade",
    description: "Pessoas com alto S são pacientes, confiáveis e cooperativas. Preferem ambientes estáveis e valorizam harmonia.",
    color: "bg-green-500",
    bgColor: "bg-green-100 dark:bg-green-950/30",
    traits: ["Paciente", "Confiável", "Cooperativo", "Leal", "Bom ouvinte"],
  },
  c: {
    key: "c",
    name: "C",
    fullName: "Conformidade",
    description: "Pessoas com alto C são precisas, analíticas e detalhistas. Valorizam qualidade, precisão e seguem regras.",
    color: "bg-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
    traits: ["Analítico", "Preciso", "Metódico", "Detalhista", "Diplomático"],
  },
};

interface DISCLegendProps {
  profile?: BehavioralProfile;
  layout?: "horizontal" | "vertical" | "grid";
  showValues?: boolean;
  showTraits?: boolean;
  interactive?: boolean;
  highlightDominant?: boolean;
  className?: string;
}

export function DISCLegend({
  profile,
  layout = "horizontal",
  showValues = true,
  showTraits = false,
  interactive = true,
  highlightDominant = true,
  className,
}: DISCLegendProps) {
  // Determinar dimensão dominante
  const dominantDimension = profile
    ? (Object.entries(profile).reduce((a, b) =>
        profile[a[0] as BehavioralDimension] > profile[b[0] as BehavioralDimension] ? a : b
      )[0] as BehavioralDimension)
    : null;

  const dimensions = Object.values(BEHAVIORAL_DIMENSIONS);

  const layoutClasses = {
    horizontal: "flex flex-wrap gap-4 justify-center",
    vertical: "flex flex-col gap-3",
    grid: "grid grid-cols-2 gap-3",
  };

  return (
    <TooltipProvider>
      <div className={cn(layoutClasses[layout], className)}>
        {dimensions.map((dim) => {
          const value = profile?.[dim.key];
          const isDominant = highlightDominant && dominantDimension === dim.key;

          const content = (
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-colors",
                interactive && "hover:bg-muted cursor-pointer",
                isDominant && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {/* Indicador de cor */}
              <div
                className={cn(
                  "w-4 h-4 rounded-full shrink-0",
                  dim.color
                )}
              />

              {/* Texto */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-foreground">
                    {dim.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dim.fullName}
                  </span>
                </div>
                {showValues && value !== undefined && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {value}%
                  </span>
                )}
                {showTraits && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dim.traits.slice(0, 3).map((trait) => (
                      <span
                        key={trait}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          dim.bgColor
                        )}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );

          if (!interactive) {
            return <div key={dim.key}>{content}</div>;
          }

          return (
            <Tooltip key={dim.key}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">{dim.fullName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {dim.description}
                </p>
                {dim.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dim.traits.map((trait) => (
                      <span
                        key={trait}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          dim.bgColor
                        )}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// Legenda compacta para uso em espaços pequenos
export function DISCLegendCompact({
  profile,
  className,
}: {
  profile?: BehavioralProfile;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 text-xs", className)}>
      {Object.values(BEHAVIORAL_DIMENSIONS).map((dim) => (
        <div key={dim.key} className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", dim.color)} />
          <span className="text-muted-foreground">
            {dim.name}
            {profile && (
              <span className="ml-1 font-medium text-foreground">
                {profile[dim.key]}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// Card detalhado de uma dimensão específica
interface DISCDimensionCardProps {
  dimension: BehavioralDimension;
  value?: number;
  className?: string;
}

export function DISCDimensionCard({
  dimension,
  value,
  className,
}: DISCDimensionCardProps) {
  const dim = BEHAVIORAL_DIMENSIONS[dimension];

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        dim.bgColor,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-4 h-4 rounded-full", dim.color)} />
          <span className="font-semibold">{dim.fullName}</span>
        </div>
        {value !== undefined && (
          <span className="text-2xl font-bold">{value}%</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">{dim.description}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {dim.traits.map((trait) => (
          <span
            key={trait}
            className="text-xs px-2 py-1 rounded-full bg-background/50"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}

export { BEHAVIORAL_DIMENSIONS };

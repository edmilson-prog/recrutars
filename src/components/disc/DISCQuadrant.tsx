/**
 * Behavioral Quadrant Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Posicionamento visual do perfil em quadrante 2D
 * Eixo X: D-C (Dominância vs Conformidade)
 * Eixo Y: I-S (Influência vs Estabilidade)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BehavioralProfile } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Cores do perfil
const QUADRANT_COLORS = {
  d: { bg: "bg-red-100 dark:bg-red-950/30", border: "border-red-300 dark:border-red-800" },
  i: { bg: "bg-yellow-100 dark:bg-yellow-950/30", border: "border-yellow-300 dark:border-yellow-800" },
  s: { bg: "bg-green-100 dark:bg-green-950/30", border: "border-green-300 dark:border-green-800" },
  c: { bg: "bg-blue-100 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-800" },
};

const QUADRANT_LABELS = {
  d: { name: "Dominância", letter: "D", description: "Alto D, Baixo C" },
  i: { name: "Influência", letter: "I", description: "Alto I, Baixo S" },
  s: { name: "Estabilidade", letter: "S", description: "Alto S, Baixo I" },
  c: { name: "Conformidade", letter: "C", description: "Alto C, Baixo D" },
};

interface DISCQuadrantProps {
  profile: BehavioralProfile;
  idealProfile?: BehavioralProfile;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showAxes?: boolean;
  interactive?: boolean;
  className?: string;
}

export function DISCQuadrant({
  profile,
  idealProfile,
  size = "md",
  showLabels = true,
  showAxes = true,
  interactive = true,
  className,
}: DISCQuadrantProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);

  // Calcular posição do ponto (0-100 para cada eixo, convertido para %)
  // X: D alto = direita, C alto = esquerda
  // Y: I alto = topo, S alto = baixo
  const position = useMemo(() => {
    const x = ((profile.d - profile.c + 100) / 200) * 100; // Normalizado para 0-100
    const y = 100 - ((profile.i - profile.s + 100) / 200) * 100; // Invertido para Y
    return { x, y };
  }, [profile]);

  const idealPosition = useMemo(() => {
    if (!idealProfile) return null;
    const x = ((idealProfile.d - idealProfile.c + 100) / 200) * 100;
    const y = 100 - ((idealProfile.i - idealProfile.s + 100) / 200) * 100;
    return { x, y };
  }, [idealProfile]);

  // Tamanhos
  const sizeConfig = {
    sm: { container: "w-48 h-48", dot: "w-4 h-4", label: "text-xs" },
    md: { container: "w-64 h-64", dot: "w-5 h-5", label: "text-sm" },
    lg: { container: "w-80 h-80", dot: "w-6 h-6", label: "text-base" },
  };

  const { container, dot, label } = sizeConfig[size];

  // Aria label
  const ariaLabel = `Quadrante Comportamental: posição em ${position.x.toFixed(0)}% horizontal, ${position.y.toFixed(0)}% vertical. Dominância ${profile.d}, Influência ${profile.i}, Estabilidade ${profile.s}, Conformidade ${profile.c}.`;

  return (
    <TooltipProvider>
      <div
        className={cn("relative", container, className)}
        role="img"
        aria-label={ariaLabel}
      >
        {/* Grid de quadrantes */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* D - Top Right */}
          <div
            className={cn(
              "relative border-r border-b transition-colors",
              QUADRANT_COLORS.i.bg,
              QUADRANT_COLORS.i.border,
              hoveredQuadrant === "i" && "brightness-95"
            )}
            onMouseEnter={() => interactive && setHoveredQuadrant("i")}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            {showLabels && (
              <span
                className={cn(
                  "absolute top-2 left-2 font-bold text-yellow-600 dark:text-yellow-400",
                  label
                )}
              >
                I
              </span>
            )}
          </div>
          <div
            className={cn(
              "relative border-b transition-colors",
              QUADRANT_COLORS.d.bg,
              QUADRANT_COLORS.d.border,
              hoveredQuadrant === "d" && "brightness-95"
            )}
            onMouseEnter={() => interactive && setHoveredQuadrant("d")}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            {showLabels && (
              <span
                className={cn(
                  "absolute top-2 right-2 font-bold text-red-600 dark:text-red-400",
                  label
                )}
              >
                D
              </span>
            )}
          </div>

          {/* Bottom Row - S, C */}
          <div
            className={cn(
              "relative border-r transition-colors",
              QUADRANT_COLORS.s.bg,
              QUADRANT_COLORS.s.border,
              hoveredQuadrant === "s" && "brightness-95"
            )}
            onMouseEnter={() => interactive && setHoveredQuadrant("s")}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            {showLabels && (
              <span
                className={cn(
                  "absolute bottom-2 left-2 font-bold text-green-600 dark:text-green-400",
                  label
                )}
              >
                S
              </span>
            )}
          </div>
          <div
            className={cn(
              "relative transition-colors",
              QUADRANT_COLORS.c.bg,
              QUADRANT_COLORS.c.border,
              hoveredQuadrant === "c" && "brightness-95"
            )}
            onMouseEnter={() => interactive && setHoveredQuadrant("c")}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            {showLabels && (
              <span
                className={cn(
                  "absolute bottom-2 right-2 font-bold text-blue-600 dark:text-blue-400",
                  label
                )}
              >
                C
              </span>
            )}
          </div>
        </div>

        {/* Eixos */}
        {showAxes && (
          <>
            {/* Eixo horizontal */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border -translate-y-px" />
            {/* Eixo vertical */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border -translate-x-px" />
          </>
        )}

        {/* Ponto do perfil ideal (se fornecido) */}
        {idealPosition && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className={cn(
                  "absolute rounded-full border-2 border-dashed border-muted-foreground bg-muted/50 cursor-pointer",
                  dot
                )}
                style={{
                  left: `calc(${idealPosition.x}% - ${parseInt(dot.split(" ")[0].replace("w-", "")) * 2}px)`,
                  top: `calc(${idealPosition.y}% - ${parseInt(dot.split(" ")[0].replace("w-", "")) * 2}px)`,
                }}
                initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Perfil Ideal da Vaga</p>
              <p className="text-xs text-muted-foreground">
                D: {idealProfile?.d} | I: {idealProfile?.i} | S: {idealProfile?.s} | C: {idealProfile?.c}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Ponto do candidato */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "absolute rounded-full bg-primary border-2 border-background shadow-lg cursor-pointer",
                dot
              )}
              style={{
                left: `calc(${position.x}% - ${parseInt(dot.split(" ")[0].replace("w-", "")) * 2}px)`,
                top: `calc(${position.y}% - ${parseInt(dot.split(" ")[0].replace("w-", "")) * 2}px)`,
              }}
              initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Seu Perfil Comportamental</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
              <span className="text-red-500">D: {profile.d}</span>
              <span className="text-yellow-500">I: {profile.i}</span>
              <span className="text-green-500">S: {profile.s}</span>
              <span className="text-blue-500">C: {profile.c}</span>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Info do quadrante em hover */}
        {hoveredQuadrant && showLabels && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <p className="font-semibold text-sm">
              {QUADRANT_LABELS[hoveredQuadrant as keyof typeof QUADRANT_LABELS].name}
            </p>
            <p className="text-xs text-muted-foreground">
              {QUADRANT_LABELS[hoveredQuadrant as keyof typeof QUADRANT_LABELS].description}
            </p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Versão compacta sem interatividade
export function DISCQuadrantMini({
  profile,
  className,
}: {
  profile: BehavioralProfile;
  className?: string;
}) {
  return (
    <DISCQuadrant
      profile={profile}
      size="sm"
      showLabels={false}
      showAxes={false}
      interactive={false}
      className={className}
    />
  );
}

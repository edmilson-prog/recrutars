/**
 * DimensionRadar Component
 * PRD-047: Teste Geral do Candidato
 *
 * Gráfico radar para visualizar scores das 3 dimensões
 */

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface DimensionData {
  dimension: string;
  fullName: string;
  description: string;
  score: number;
  color: string;
}

interface DimensionRadarProps {
  personalityScore: number;
  characterScore: number;
  competencyScore: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const DIMENSION_INFO = {
  personality: {
    name: 'Personalidade',
    description: 'Traços de personalidade e preferências comportamentais',
    color: '#8B5CF6', // Purple
  },
  character: {
    name: 'Caráter',
    description: 'Valores éticos, integridade e confiabilidade',
    color: '#F59E0B', // Amber
  },
  competencies: {
    name: 'Competências',
    description: 'Habilidades profissionais e comportamentais',
    color: '#3B82F6', // Blue
  },
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DimensionData }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-foreground flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        {data.fullName}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
      <p className="text-lg font-bold text-foreground mt-2">
        {data.score}
        <span className="text-sm text-muted-foreground">%</span>
      </p>
    </div>
  );
}

export function DimensionRadar({
  personalityScore,
  characterScore,
  competencyScore,
  size = 'md',
  showLabels = true,
  className,
}: DimensionRadarProps) {
  const prefersReducedMotion = useReducedMotion();

  const chartData: DimensionData[] = [
    {
      dimension: 'P',
      fullName: DIMENSION_INFO.personality.name,
      description: DIMENSION_INFO.personality.description,
      score: personalityScore,
      color: DIMENSION_INFO.personality.color,
    },
    {
      dimension: 'Ca',
      fullName: DIMENSION_INFO.character.name,
      description: DIMENSION_INFO.character.description,
      score: characterScore,
      color: DIMENSION_INFO.character.color,
    },
    {
      dimension: 'Co',
      fullName: DIMENSION_INFO.competencies.name,
      description: DIMENSION_INFO.competencies.description,
      score: competencyScore,
      color: DIMENSION_INFO.competencies.color,
    },
  ];

  const sizeConfig = {
    sm: { height: 200, outerRadius: '65%' },
    md: { height: 300, outerRadius: '70%' },
    lg: { height: 400, outerRadius: '75%' },
  };

  const { height, outerRadius } = sizeConfig[size];

  const ariaLabel = `Perfil comportamental: Personalidade ${personalityScore}%, Caráter ${characterScore}%, Competências ${competencyScore}%`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData} outerRadius={outerRadius}>
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={
              showLabels
                ? {
                    fill: 'hsl(var(--foreground))',
                    fontSize: size === 'sm' ? 12 : 14,
                    fontWeight: 600,
                  }
                : false
            }
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={
              showLabels
                ? {
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 10,
                  }
                : false
            }
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={500}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      {showLabels && (
        <div className="flex justify-center gap-4 mt-4">
          {chartData.map((item) => (
            <div key={item.dimension} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.fullName}: <strong>{item.score}%</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Versão mini para cards
 */
export function DimensionRadarMini({
  personalityScore,
  characterScore,
  competencyScore,
  className,
}: {
  personalityScore: number;
  characterScore: number;
  competencyScore: number;
  className?: string;
}) {
  return (
    <DimensionRadar
      personalityScore={personalityScore}
      characterScore={characterScore}
      competencyScore={competencyScore}
      size="sm"
      showLabels={false}
      className={className}
    />
  );
}

/**
 * Barras simples como alternativa ao radar
 */
export function DimensionBars({
  personalityScore,
  characterScore,
  competencyScore,
  className,
}: {
  personalityScore: number;
  characterScore: number;
  competencyScore: number;
  className?: string;
}) {
  const dimensions = [
    {
      name: 'Personalidade',
      score: personalityScore,
      color: DIMENSION_INFO.personality.color,
    },
    {
      name: 'Caráter',
      score: characterScore,
      color: DIMENSION_INFO.character.color,
    },
    {
      name: 'Competências',
      score: competencyScore,
      color: DIMENSION_INFO.competencies.color,
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {dimensions.map((dim, index) => (
        <motion.div
          key={dim.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">
              {dim.name}
            </span>
            <span className="text-sm font-bold" style={{ color: dim.color }}>
              {dim.score}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dim.score}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: dim.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

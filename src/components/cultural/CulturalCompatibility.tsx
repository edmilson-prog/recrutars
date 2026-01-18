/**
 * Cultural Compatibility Card Component
 * PRD-042: Fit Cultural
 *
 * Displays compatibility score between candidate and company
 */

import { motion } from 'framer-motion';
import { Heart, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CulturalCompatibility as CulturalCompatibilityType } from '@/types/culturalFit';
import { DIMENSION_LABELS, DIMENSION_ICONS } from '@/types/culturalFit';
import { getCompatibilityLabel } from '@/lib/culturalFit';

interface CulturalCompatibilityProps {
  compatibility: CulturalCompatibilityType;
  companyName?: string;
  showDetails?: boolean;
  className?: string;
}

export function CulturalCompatibility({
  compatibility,
  companyName = 'a empresa',
  showDetails = true,
  className,
}: CulturalCompatibilityProps) {
  const { label, color, description } = getCompatibilityLabel(compatibility.overallScore);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-pink-500" />
            Fit Cultural
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>
                  O fit cultural é calculado com base na compatibilidade entre o perfil
                  comportamental DISC do candidato e o perfil cultural de {companyName}.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={cn(
              'w-20 h-20 rounded-full flex flex-col items-center justify-center',
              'bg-gradient-to-br from-primary/20 to-secondary/20 border-4',
              compatibility.overallScore >= 70
                ? 'border-green-500'
                : compatibility.overallScore >= 50
                  ? 'border-yellow-500'
                  : 'border-red-500'
            )}
          >
            <span className="text-2xl font-bold">{compatibility.overallScore}</span>
            <span className="text-xs text-muted-foreground">de 100</span>
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className={cn('font-semibold', color)}>{label}</span>
              <TrendingUp className={cn('w-4 h-4', color)} />
            </div>
            <Progress
              value={compatibility.overallScore}
              className={cn(
                'h-3',
                compatibility.overallScore >= 70
                  ? '[&>div]:bg-green-500'
                  : compatibility.overallScore >= 50
                    ? '[&>div]:bg-yellow-500'
                    : '[&>div]:bg-red-500'
              )}
            />
          </div>
        </div>

        {/* Strengths & Watch Points */}
        {showDetails && (
          <>
            {compatibility.strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Pontos fortes
                </p>
                <div className="flex flex-wrap gap-2">
                  {compatibility.strengths.map(dim => (
                    <Badge
                      key={dim}
                      variant="outline"
                      className="gap-1 border-green-500 text-green-600"
                    >
                      {DIMENSION_ICONS[dim]}
                      {DIMENSION_LABELS[dim]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {compatibility.watchPoints.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Pontos de atenção
                </p>
                <div className="flex flex-wrap gap-2">
                  {compatibility.watchPoints.map(dim => (
                    <Badge
                      key={dim}
                      variant="outline"
                      className="gap-1 border-yellow-500 text-yellow-600"
                    >
                      {DIMENSION_ICONS[dim]}
                      {DIMENSION_LABELS[dim]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for lists
interface CulturalCompatibilityBadgeProps {
  score: number;
  className?: string;
}

export function CulturalCompatibilityBadge({
  score,
  className,
}: CulturalCompatibilityBadgeProps) {
  const { label, color } = getCompatibilityLabel(score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'gap-1 cursor-help',
              score >= 70
                ? 'border-green-500 text-green-600'
                : score >= 50
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-red-500 text-red-600',
              className
            )}
          >
            <Heart className="w-3 h-3" />
            {score}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Fit Cultural: {label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

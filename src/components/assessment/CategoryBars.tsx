/**
 * CategoryBars Component
 * PRD-047: Teste Geral do Candidato
 *
 * Barras de progresso por categoria
 */

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { assessmentCategories, assessmentDimensions } from '@/data/assessmentData';

interface CategoryBarsProps {
  categoryScores: Record<string, number>;
  strengths: string[];
  developmentAreas: string[];
  className?: string;
}

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

function getCategoryDimension(categoryId: string): string | undefined {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  if (!category) return undefined;
  const dimension = assessmentDimensions.find(
    (d) => d.id === category.dimensionId
  );
  return dimension?.name;
}

function getDimensionColor(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  if (!category) return 'bg-gray-500';

  switch (category.dimensionId) {
    case 'dim-personality':
      return 'bg-purple-500';
    case 'dim-character':
      return 'bg-amber-500';
    case 'dim-competencies':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

export function CategoryBars({
  categoryScores,
  strengths,
  developmentAreas,
  className,
}: CategoryBarsProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(
    'dim-personality'
  );

  // Agrupar categorias por dimensão
  const categoriesByDimension = assessmentDimensions.map((dim) => ({
    dimension: dim,
    categories: assessmentCategories
      .filter((cat) => cat.dimensionId === dim.id)
      .map((cat) => ({
        ...cat,
        score: categoryScores[cat.id] || 0,
        isStrength: strengths.includes(cat.name),
        isDevelopment: developmentAreas.includes(cat.name),
      }))
      .sort((a, b) => b.score - a.score),
  }));

  return (
    <div className={cn('space-y-4', className)}>
      {categoriesByDimension.map(({ dimension, categories }) => (
        <div key={dimension.id} className="bg-card rounded-xl overflow-hidden">
          {/* Header */}
          <button
            onClick={() =>
              setExpandedDimension(
                expandedDimension === dimension.id ? null : dimension.id
              )
            }
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{dimension.icon}</span>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">
                  {dimension.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {categories.length} categorias
                </p>
              </div>
            </div>
            {expandedDimension === dimension.id ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Categories */}
          {expandedDimension === dimension.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="p-4 space-y-3">
                {categories.map((cat, index) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {cat.name}
                        </span>
                        {cat.isStrength && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {cat.isDevelopment && (
                          <TrendingDown className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-bold',
                          getScoreColor(cat.score)
                        )}
                      >
                        {cat.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className={cn('h-full rounded-full', getDimensionColor(cat.id))}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Versão compacta mostrando apenas top e bottom
 */
export function CategoryBarsCompact({
  categoryScores,
  strengths,
  developmentAreas,
  className,
}: CategoryBarsProps) {
  // Top 3 e Bottom 3
  const sortedCategories = Object.entries(categoryScores)
    .map(([id, score]) => ({ id, score, name: getCategoryName(id) }))
    .sort((a, b) => b.score - a.score);

  const topCategories = sortedCategories.slice(0, 3);
  const bottomCategories = sortedCategories.slice(-3).reverse();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Strengths */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-foreground">Pontos Fortes</h4>
        </div>
        <div className="space-y-2">
          {topCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground w-20 truncate">
                {cat.name}
              </span>
              <span className="text-sm font-bold text-green-500 w-10 text-right">
                {cat.score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Development Areas */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-foreground">Áreas de Desenvolvimento</h4>
        </div>
        <div className="space-y-2">
          {bottomCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground w-20 truncate">
                {cat.name}
              </span>
              <span className="text-sm font-bold text-amber-500 w-10 text-right">
                {cat.score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * CategoryTree Component
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Visualização hierárquica de dimensões e categorias
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Power,
  PowerOff,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DimensionBadge } from './DimensionBadge';
import type {
  AssessmentDimension,
  AssessmentCategory,
} from '@/types/assessment';

interface CategoryTreeProps {
  dimensions: (AssessmentDimension & { categoryCount: number; questionCount: number })[];
  categoriesByDimension: Record<
    string,
    (AssessmentCategory & { questionCount: number })[]
  >;
  onEditCategory?: (category: AssessmentCategory) => void;
  onToggleCategoryStatus?: (category: AssessmentCategory) => void;
}

export function CategoryTree({
  dimensions,
  categoriesByDimension,
  onEditCategory,
  onToggleCategoryStatus,
}: CategoryTreeProps) {
  // Track which dimensions are expanded
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(dimensions.map((d) => d.id))
  );

  const toggleDimension = (dimensionId: string) => {
    setExpandedDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(dimensionId)) {
        next.delete(dimensionId);
      } else {
        next.add(dimensionId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {dimensions.map((dimension) => {
        const isExpanded = expandedDimensions.has(dimension.id);
        const categories = categoriesByDimension[dimension.id] || [];

        return (
          <div
            key={dimension.id}
            className="border rounded-lg overflow-hidden bg-card"
          >
            {/* Dimension header */}
            <button
              className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors text-left"
              onClick={() => toggleDimension(dimension.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}

              <span className="text-2xl flex-shrink-0">{dimension.icon}</span>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{dimension.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {dimension.description}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="font-mono">
                  {categories.length} categorias
                </Badge>
                <Badge variant="outline" className="font-mono">
                  <FileQuestion className="h-3 w-3 mr-1" />
                  {dimension.questionCount}
                </Badge>
              </div>
            </button>

            {/* Categories list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t bg-muted/30">
                    {categories.map((category, index) => (
                      <CategoryRow
                        key={category.id}
                        category={category}
                        index={index}
                        isLast={index === categories.length - 1}
                        onEdit={() => onEditCategory?.(category)}
                        onToggleStatus={() => onToggleCategoryStatus?.(category)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

interface CategoryRowProps {
  category: AssessmentCategory & { questionCount: number };
  index: number;
  isLast: boolean;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}

function CategoryRow({
  category,
  index,
  isLast,
  onEdit,
  onToggleStatus,
}: CategoryRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 hover:bg-accent/30 transition-colors',
        !isLast && 'border-b border-border/50',
        !category.isActive && 'opacity-50'
      )}
    >
      {/* Order number */}
      <span className="font-mono text-sm text-muted-foreground w-6 text-right">
        {category.order}
      </span>

      {/* Category info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{category.name}</h4>
          {!category.isActive && (
            <Badge variant="outline" className="text-xs text-destructive">
              Inativa
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {category.description}
        </p>
      </div>

      {/* Question count */}
      <Badge variant="outline" className="font-mono flex-shrink-0">
        <FileQuestion className="h-3 w-3 mr-1" />
        {category.questionCount}
      </Badge>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8',
            category.isActive ? 'text-success' : 'text-destructive'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus?.();
          }}
        >
          {category.isActive ? (
            <Power className="h-4 w-4" />
          ) : (
            <PowerOff className="h-4 w-4" />
          )}
          <span className="sr-only">
            {category.isActive ? 'Desativar' : 'Ativar'}
          </span>
        </Button>
      </div>
    </div>
  );
}

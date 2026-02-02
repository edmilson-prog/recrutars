/**
 * TestPreview Component
 * PRD-048: Teste por Vaga
 *
 * Preview do teste antes de publicar
 */

import { motion } from 'framer-motion';
import {
  Clock,
  FileQuestion,
  Target,
  CheckCircle2,
  AlertTriangle,
  Edit2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DimensionBadge } from '@/components/assessment';
import { assessmentCategories, assessmentDimensions } from '@/data/assessmentData';
import type { SelectedCompetencies, AssessmentQuestion } from '@/types/assessment';

interface TestPreviewProps {
  title: string;
  competencies: SelectedCompetencies;
  questions: AssessmentQuestion[];
  estimatedMinutes: number;
  expirationDays: number;
  onEdit: (step: number) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing?: boolean;
  className?: string;
}

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

function getCategoryDimensionId(categoryId: string): string | undefined {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.dimensionId;
}

export function TestPreview({
  title,
  competencies,
  questions,
  estimatedMinutes,
  expirationDays,
  onEdit,
  onPublish,
  onSaveDraft,
  isPublishing,
  className,
}: TestPreviewProps) {
  const allCompetencyIds = [...competencies.critical, ...competencies.important];

  // Agrupar perguntas por dimensão
  const questionsByDimension = questions.reduce((acc, q) => {
    const category = assessmentCategories.find((c) => c.id === q.categoryId);
    const dimId = category?.dimensionId || 'unknown';
    if (!acc[dimId]) {
      acc[dimId] = [];
    }
    acc[dimId].push(q);
    return acc;
  }, {} as Record<string, AssessmentQuestion[]>);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Revisão do Teste
        </h2>
        <p className="text-muted-foreground">
          Revise as configurações antes de publicar
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <FileQuestion className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{questions.length}</div>
          <div className="text-xs text-muted-foreground">Perguntas</div>
        </div>
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">
            {allCompetencyIds.length}
          </div>
          <div className="text-xs text-muted-foreground">Competências</div>
        </div>
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">
            ~{estimatedMinutes}
          </div>
          <div className="text-xs text-muted-foreground">Minutos</div>
        </div>
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{expirationDays}</div>
          <div className="text-xs text-muted-foreground">Dias válido</div>
        </div>
      </div>

      {/* Title section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 shadow-soft"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-muted-foreground">Título do Teste</h3>
            <p className="font-semibold text-foreground">{title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Competencies section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-4 shadow-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-muted-foreground">
            Competências Avaliadas
          </h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Critical */}
          {competencies.critical.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-red-500 uppercase">
                  Críticas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {competencies.critical.map((id) => (
                  <Badge key={id} variant="destructive">
                    {getCategoryName(id)} (Peso: {competencies.weights[id]})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Important */}
          {competencies.important.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-500 uppercase">
                  Importantes
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {competencies.important.map((id) => (
                  <Badge
                    key={id}
                    variant="outline"
                    className="border-amber-500 text-amber-600"
                  >
                    {getCategoryName(id)} (Peso: {competencies.weights[id]})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Questions section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-4 shadow-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-muted-foreground">
            Distribuição das Perguntas
          </h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {Object.entries(questionsByDimension).map(([dimId, dimQuestions]) => {
            const dimension = assessmentDimensions.find((d) => d.id === dimId);
            if (!dimension) return null;

            return (
              <div key={dimId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{dimension.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {dimension.name}
                  </span>
                </div>
                <Badge variant="secondary">{dimQuestions.length} perguntas</Badge>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Warnings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Antes de publicar</p>
            <ul className="list-disc list-inside space-y-1">
              <li>O teste não poderá ser editado após publicação</li>
              <li>
                Candidatos terão {expirationDays} dias para completar após o
                convite
              </li>
              <li>Você poderá arquivar o teste a qualquer momento</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="flex-1"
          disabled={isPublishing}
        >
          Salvar Rascunho
        </Button>
        <Button
          onClick={onPublish}
          className="flex-1 gradient-primary"
          disabled={isPublishing}
        >
          {isPublishing ? 'Publicando...' : 'Publicar Teste'}
        </Button>
      </div>
    </div>
  );
}

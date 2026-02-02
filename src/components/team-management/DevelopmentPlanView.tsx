/**
 * DevelopmentPlanView
 * PRD-057: Composicao principal do plano de desenvolvimento.
 * Exibe progresso, objetivos agrupados por dimensao, e botao de gerar PDI automatico.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sparkles, ClipboardList } from 'lucide-react';
import PDIProgressBar from './PDIProgressBar';
import ObjectiveCard from './ObjectiveCard';
import {
  DIMENSION_SHORT_NAMES,
  DIMENSION_NAMES,
  type GaugeProDimension,
  type DimensionScores,
} from '@/types/gaugePro';
import type {
  DevelopmentPlan,
  DevelopmentObjective,
  ObjectiveStatus,
  ObjectivePriority,
} from '@/types/teamManagement';

interface DevelopmentPlanViewProps {
  plan: DevelopmentPlan | null;
  memberScores?: DimensionScores;
  onUpdateObjective: (id: string, status: ObjectiveStatus) => void;
  onEditObjective: (objective: DevelopmentObjective) => void;
  onAddObjective: () => void;
  onGeneratePDI?: (objectives: DevelopmentObjective[]) => void;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const DIMENSION_HEADER_COLORS: Record<GaugeProDimension, string> = {
  D1: 'border-l-cyan-600',
  D2: 'border-l-violet-600',
  D3: 'border-l-emerald-600',
  D4: 'border-l-amber-600',
  D5: 'border-l-pink-600',
};

/**
 * Auto-generate PDI objectives based on dimension scores.
 * - 0-33: priority development area -> 2 objectives (intensive)
 * - 34-50: development area -> 1 objective (moderate)
 * - 51-66: maintenance -> 1 objective (strengthen)
 * - 67-100: strength -> 1 objective (leverage)
 */
function generateAutoPDI(scores: DimensionScores): DevelopmentObjective[] {
  const now = new Date().toISOString();
  const objectives: DevelopmentObjective[] = [];
  let idx = 1;

  const templates: Record<
    GaugeProDimension,
    { intensive: string[]; moderate: string; strengthen: string; leverage: string }
  > = {
    D1: {
      intensive: [
        'Programa intensivo de assertividade e tomada de decisão',
        'Mentoria individual para desenvolver posicionamento em reuniões',
      ],
      moderate: 'Treinamento de assertividade com foco em liderança situacional',
      strengthen: 'Manter assertividade com foco em delegação estratégica',
      leverage: 'Alavancar assertividade como mentor de líderes emergentes',
    },
    D2: {
      intensive: [
        'Workshop intensivo de comunicação e networking profissional',
        'Participação em grupos de trabalho cross-departamento',
      ],
      moderate: 'Treinamento de comunicação e colaboração em equipe',
      strengthen: 'Manter sociabilidade com foco em influência estratégica',
      leverage: 'Alavancar sociabilidade como facilitador de integração entre equipes',
    },
    D3: {
      intensive: [
        'Programa de gestão de tempo e produtividade com acompanhamento semanal',
        'Implementar metodologia GTD com revisão de hábitos de trabalho',
      ],
      moderate: 'Treinamento de gestão de tempo e priorização de tarefas',
      strengthen: 'Manter ritmo de entrega com revisão trimestral de processos',
      leverage: 'Alavancar consistência de ritmo como referência para a equipe',
    },
    D4: {
      intensive: [
        'Programa intensivo de organização e conformidade com processos',
        'Coaching individual para desenvolvimento de disciplina operacional',
      ],
      moderate: 'Treinamento de conformidade e aderência a processos da empresa',
      strengthen: 'Manter conformidade com foco em melhoria contínua de processos',
      leverage: 'Alavancar conformidade como auditor e consultor interno de processos',
    },
    D5: {
      intensive: [
        'Programa de inteligência emocional e empatia com acompanhamento',
        'Workshop de feedback construtivo e escuta ativa',
      ],
      moderate: 'Treinamento de inteligência emocional e relacionamento interpessoal',
      strengthen: 'Manter orientação relacional com foco em mediação de conflitos',
      leverage: 'Alavancar empatia como mentor relacional e mediador da equipe',
    },
  };

  for (const dim of DIMENSIONS) {
    const score = scores[dim];
    const dimTemplates = templates[dim];

    if (score <= 33) {
      // Priority development area: 2 intensive objectives
      for (const title of dimTemplates.intensive) {
        objectives.push({
          id: `auto-obj-${idx++}`,
          planId: '',
          dimension: dim,
          title,
          description: `Área de desenvolvimento prioritário em ${DIMENSION_NAMES[dim]} (score: ${score}).`,
          status: 'pending',
          priority: 'high' as ObjectivePriority,
          createdAt: now,
        });
      }
    } else if (score <= 50) {
      // Development area: 1 moderate objective
      objectives.push({
        id: `auto-obj-${idx++}`,
        planId: '',
        dimension: dim,
        title: dimTemplates.moderate,
        description: `Área de desenvolvimento em ${DIMENSION_NAMES[dim]} (score: ${score}).`,
        status: 'pending',
        priority: 'medium' as ObjectivePriority,
        createdAt: now,
      });
    } else if (score <= 66) {
      // Maintenance: 1 strengthen objective
      objectives.push({
        id: `auto-obj-${idx++}`,
        planId: '',
        dimension: dim,
        title: dimTemplates.strengthen,
        description: `Manutenção em ${DIMENSION_NAMES[dim]} (score: ${score}).`,
        status: 'pending',
        priority: 'low' as ObjectivePriority,
        createdAt: now,
      });
    } else {
      // Strength: 1 leverage objective
      objectives.push({
        id: `auto-obj-${idx++}`,
        planId: '',
        dimension: dim,
        title: dimTemplates.leverage,
        description: `Ponto forte em ${DIMENSION_NAMES[dim]} (score: ${score}).`,
        status: 'pending',
        priority: 'low' as ObjectivePriority,
        createdAt: now,
      });
    }
  }

  return objectives;
}

export default function DevelopmentPlanView({
  plan,
  memberScores,
  onUpdateObjective,
  onEditObjective,
  onAddObjective,
  onGeneratePDI,
}: DevelopmentPlanViewProps) {
  // Group objectives by dimension
  const groupedObjectives = useMemo(() => {
    if (!plan) return {};
    const groups: Partial<Record<GaugeProDimension, DevelopmentObjective[]>> = {};
    for (const obj of plan.objectives) {
      if (!groups[obj.dimension]) {
        groups[obj.dimension] = [];
      }
      groups[obj.dimension]!.push(obj);
    }
    return groups;
  }, [plan]);

  const dimensionsWithObjectives = useMemo(() => {
    return DIMENSIONS.filter(
      (dim) => groupedObjectives[dim] && groupedObjectives[dim]!.length > 0,
    );
  }, [groupedObjectives]);

  // Empty state
  if (!plan) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="font-medium text-muted-foreground">
              Nenhum plano de desenvolvimento encontrado
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Gere um PDI automaticamente com base no perfil comportamental do colaborador.
            </p>
          </div>
          {memberScores && onGeneratePDI && (
            <Button
              onClick={() => onGeneratePDI(generateAutoPDI(memberScores))}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Gerar PDI Automático
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <PDIProgressBar plan={plan} />
        </CardContent>
      </Card>

      {/* Objectives grouped by dimension */}
      {dimensionsWithObjectives.map((dim) => (
        <div key={dim} className="space-y-3">
          <div
            className={cn(
              'border-l-4 pl-3 py-1',
              DIMENSION_HEADER_COLORS[dim],
            )}
          >
            <h3 className="font-semibold text-sm">
              {DIMENSION_SHORT_NAMES[dim]}
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                {DIMENSION_NAMES[dim]}
              </span>
            </h3>
          </div>

          <div className="space-y-2 pl-1">
            {groupedObjectives[dim]!.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                onStatusChange={onUpdateObjective}
                onEdit={onEditObjective}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Add objective button */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onAddObjective} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Objetivo
        </Button>
      </div>
    </div>
  );
}

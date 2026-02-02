/**
 * Hook: useCompetencySelection
 * PRD-048: Teste por Vaga
 *
 * Seleção de competências e sugestão de perguntas para teste por vaga
 */

import { useState, useCallback, useMemo } from 'react';
import {
  assessmentCategories,
  assessmentDimensions,
  assessmentQuestions,
} from '@/data/assessmentData';
import { JOB_TEST_CONFIG } from '@/data/behavioralAssessmentData';
import type {
  AssessmentCategory,
  AssessmentQuestion,
  SelectedCompetencies,
} from '@/types/assessment';

export interface CompetencyOption extends AssessmentCategory {
  dimensionName: string;
  dimensionIcon: string;
  questionCount: number;
}

export interface UseCompetencySelectionReturn {
  // Data
  competencyOptions: CompetencyOption[];
  selectedCompetencies: SelectedCompetencies;
  suggestedQuestions: AssessmentQuestion[];

  // Actions
  selectCompetency: (categoryId: string, priority: 'critical' | 'important') => void;
  removeCompetency: (categoryId: string) => void;
  setWeight: (categoryId: string, weight: number) => void;
  clearSelection: () => void;

  // Computed
  canAddMore: boolean;
  totalSelected: number;
  estimatedQuestions: number;
  estimatedMinutes: number;
}

// Embaralhar array
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useCompetencySelection(): UseCompetencySelectionReturn {
  const config = JOB_TEST_CONFIG;

  const [selectedCompetencies, setSelectedCompetencies] = useState<SelectedCompetencies>({
    critical: [],
    important: [],
    weights: {},
  });

  // Construir opções de competências
  const competencyOptions: CompetencyOption[] = useMemo(() => {
    return assessmentCategories
      .filter((cat) => cat.isActive)
      .map((cat) => {
        const dimension = assessmentDimensions.find((d) => d.id === cat.dimensionId);
        const questionCount = assessmentQuestions.filter(
          (q) => q.categoryId === cat.id && q.isActive
        ).length;

        return {
          ...cat,
          dimensionName: dimension?.name || '',
          dimensionIcon: dimension?.icon || '',
          questionCount,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, []);

  // Gerar perguntas sugeridas com base nas competências selecionadas
  const suggestedQuestions: AssessmentQuestion[] = useMemo(() => {
    const allSelectedIds = [
      ...selectedCompetencies.critical,
      ...selectedCompetencies.important,
    ];

    if (allSelectedIds.length === 0) return [];

    const questions: AssessmentQuestion[] = [];
    const selectedIds = new Set<string>();

    // Distribuir perguntas por competência
    const questionsPerCompetency = Math.ceil(
      config.maxQuestions / allSelectedIds.length
    );

    // Priorizar competências críticas (mais perguntas)
    selectedCompetencies.critical.forEach((catId) => {
      const catQuestions = assessmentQuestions.filter(
        (q) => q.categoryId === catId && q.isActive && !selectedIds.has(q.id)
      );

      const selected = shuffle(catQuestions).slice(
        0,
        Math.min(questionsPerCompetency + 2, catQuestions.length) // +2 para críticas
      );

      selected.forEach((q) => {
        questions.push(q);
        selectedIds.add(q.id);
      });
    });

    // Competências importantes
    selectedCompetencies.important.forEach((catId) => {
      const catQuestions = assessmentQuestions.filter(
        (q) => q.categoryId === catId && q.isActive && !selectedIds.has(q.id)
      );

      const selected = shuffle(catQuestions).slice(
        0,
        Math.min(questionsPerCompetency, catQuestions.length)
      );

      selected.forEach((q) => {
        questions.push(q);
        selectedIds.add(q.id);
      });
    });

    // Limitar ao máximo configurado
    return shuffle(questions).slice(0, config.maxQuestions);
  }, [selectedCompetencies, config.maxQuestions]);

  // Selecionar competência
  const selectCompetency = useCallback(
    (categoryId: string, priority: 'critical' | 'important') => {
      setSelectedCompetencies((prev) => {
        // Remover de outras listas se já existir
        const newCritical = prev.critical.filter((id) => id !== categoryId);
        const newImportant = prev.important.filter((id) => id !== categoryId);

        // Adicionar na lista correta
        if (priority === 'critical') {
          newCritical.push(categoryId);
        } else {
          newImportant.push(categoryId);
        }

        // Definir peso padrão
        const newWeights = { ...prev.weights };
        if (!(categoryId in newWeights)) {
          newWeights[categoryId] = priority === 'critical' ? 5 : 3;
        }

        return {
          critical: newCritical,
          important: newImportant,
          weights: newWeights,
        };
      });
    },
    []
  );

  // Remover competência
  const removeCompetency = useCallback((categoryId: string) => {
    setSelectedCompetencies((prev) => {
      const newWeights = { ...prev.weights };
      delete newWeights[categoryId];

      return {
        critical: prev.critical.filter((id) => id !== categoryId),
        important: prev.important.filter((id) => id !== categoryId),
        weights: newWeights,
      };
    });
  }, []);

  // Definir peso
  const setWeight = useCallback((categoryId: string, weight: number) => {
    setSelectedCompetencies((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [categoryId]: Math.max(1, Math.min(5, weight)),
      },
    }));
  }, []);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedCompetencies({
      critical: [],
      important: [],
      weights: {},
    });
  }, []);

  // Computed values
  const totalSelected =
    selectedCompetencies.critical.length + selectedCompetencies.important.length;

  const canAddMore = totalSelected < config.maxCompetencies;

  const estimatedQuestions = suggestedQuestions.length;
  const estimatedMinutes = Math.ceil(estimatedQuestions * 1.2); // ~1.2 min por pergunta

  return {
    competencyOptions,
    selectedCompetencies,
    suggestedQuestions,
    selectCompetency,
    removeCompetency,
    setWeight,
    clearSelection,
    canAddMore,
    totalSelected,
    estimatedQuestions,
    estimatedMinutes,
  };
}

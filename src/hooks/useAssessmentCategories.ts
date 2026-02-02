/**
 * Hook: useAssessmentCategories
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Gerencia dimensões e categorias de avaliação
 */

import { useState, useMemo, useCallback } from 'react';
import {
  assessmentDimensions as initialDimensions,
  assessmentCategories as initialCategories,
  assessmentQuestions,
} from '@/data/assessmentData';
import type {
  AssessmentDimension,
  AssessmentCategory,
  CategoryFormData,
} from '@/types/assessment';

export function useAssessmentCategories() {
  // State
  const [dimensions] = useState<AssessmentDimension[]>(initialDimensions);
  const [categories, setCategories] = useState<AssessmentCategory[]>(initialCategories);

  // Computed: dimensions with category and question counts
  const dimensionsWithCounts = useMemo(() => {
    return dimensions.map((dim) => {
      const dimCategories = categories.filter((c) => c.dimensionId === dim.id);
      const categoryIds = dimCategories.map((c) => c.id);
      const questionCount = assessmentQuestions.filter((q) =>
        categoryIds.includes(q.categoryId)
      ).length;

      return {
        ...dim,
        categoryCount: dimCategories.length,
        questionCount,
      };
    });
  }, [dimensions, categories]);

  // Computed: categories with question counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map((cat) => {
      const questionCount = assessmentQuestions.filter(
        (q) => q.categoryId === cat.id
      ).length;

      return {
        ...cat,
        questionCount,
      };
    });
  }, [categories]);

  // Computed: categories grouped by dimension
  const categoriesByDimension = useMemo(() => {
    const grouped: Record<string, (AssessmentCategory & { questionCount: number })[]> = {};

    dimensions.forEach((dim) => {
      grouped[dim.id] = categoriesWithCounts
        .filter((c) => c.dimensionId === dim.id)
        .sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [dimensions, categoriesWithCounts]);

  // Computed: flat list for select dropdowns
  const categoryOptions = useMemo(() => {
    return categoriesWithCounts.map((cat) => {
      const dimension = dimensions.find((d) => d.id === cat.dimensionId);
      return {
        value: cat.id,
        label: cat.name,
        dimensionId: cat.dimensionId,
        dimensionName: dimension?.name || '',
        questionCount: cat.questionCount,
      };
    });
  }, [categoriesWithCounts, dimensions]);

  // Actions
  const getDimensionById = useCallback(
    (id: string): AssessmentDimension | undefined => {
      return dimensions.find((d) => d.id === id);
    },
    [dimensions]
  );

  const getCategoryById = useCallback(
    (id: string): AssessmentCategory | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  const getCategoriesByDimensionId = useCallback(
    (dimensionId: string): AssessmentCategory[] => {
      return categories
        .filter((c) => c.dimensionId === dimensionId)
        .sort((a, b) => a.order - b.order);
    },
    [categories]
  );

  const updateCategory = useCallback(
    (id: string, data: Partial<CategoryFormData>): AssessmentCategory | null => {
      let updatedCategory: AssessmentCategory | null = null;

      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            updatedCategory = {
              ...c,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            return updatedCategory;
          }
          return c;
        })
      );

      return updatedCategory;
    },
    []
  );

  const toggleCategoryStatus = useCallback((id: string): void => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  // Stats
  const stats = useMemo(() => {
    const totalDimensions = dimensions.length;
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => c.isActive).length;
    const totalQuestions = assessmentQuestions.length;
    const activeQuestions = assessmentQuestions.filter((q) => q.isActive).length;

    return {
      totalDimensions,
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      totalQuestions,
      activeQuestions,
    };
  }, [dimensions, categories]);

  return {
    // Data
    dimensions: dimensionsWithCounts,
    categories: categoriesWithCounts,
    categoriesByDimension,
    categoryOptions,
    stats,

    // Getters
    getDimensionById,
    getCategoryById,
    getCategoriesByDimensionId,

    // Actions
    updateCategory,
    toggleCategoryStatus,
  };
}

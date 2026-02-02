/**
 * Hook: useAssessmentQuestions
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Gerencia CRUD de perguntas com filtros, busca e paginação
 */

import { useState, useMemo, useCallback } from 'react';
import {
  assessmentQuestions as initialQuestions,
  assessmentCategories,
  assessmentDimensions,
  getCategoryById,
  getQuestionDimension,
} from '@/data/assessmentData';
import type {
  AssessmentQuestion,
  QuestionFilters,
  PaginatedResult,
  QuestionBankStats,
  QuestionFormData,
} from '@/types/assessment';
import { useDebounce } from '@/hooks/useDebounce';

const DEFAULT_PAGE_SIZE = 50;

interface UseAssessmentQuestionsOptions {
  pageSize?: number;
}

export function useAssessmentQuestions(options: UseAssessmentQuestionsOptions = {}) {
  const { pageSize = DEFAULT_PAGE_SIZE } = options;

  // State
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(initialQuestions);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Computed: filtered questions
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by search (text or code)
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (q) =>
          q.text.toLowerCase().includes(search) ||
          q.code.toLowerCase().includes(search)
      );
    }

    // Filter by dimension
    if (filters.dimensionId) {
      const categoryIds = assessmentCategories
        .filter((c) => c.dimensionId === filters.dimensionId)
        .map((c) => c.id);
      result = result.filter((q) => categoryIds.includes(q.categoryId));
    }

    // Filter by category
    if (filters.categoryId) {
      result = result.filter((q) => q.categoryId === filters.categoryId);
    }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      result = result.filter((q) => q.type === filters.type);
    }

    // Filter by level
    if (filters.level && filters.level !== 'all') {
      result = result.filter((q) => q.level === filters.level);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((q) => q.isActive === isActive);
    }

    // Sort by code (numeric order)
    result.sort((a, b) => {
      const [aCategory, aNumber] = a.code.split('.').map(Number);
      const [bCategory, bNumber] = b.code.split('.').map(Number);
      if (aCategory !== bCategory) return aCategory - bCategory;
      return aNumber - bNumber;
    });

    return result;
  }, [questions, debouncedSearch, filters]);

  // Computed: paginated result
  const paginatedResult = useMemo((): PaginatedResult<AssessmentQuestion> => {
    const total = filteredQuestions.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredQuestions.slice(start, end);

    return {
      items,
      total,
      page: currentPage,
      pageSize,
      totalPages,
    };
  }, [filteredQuestions, currentPage, pageSize]);

  // Computed: statistics
  const stats = useMemo((): QuestionBankStats => {
    const totalQuestions = questions.length;
    const activeQuestions = questions.filter((q) => q.isActive).length;
    const inactiveQuestions = totalQuestions - activeQuestions;

    const byDimension: Record<string, number> = {};
    assessmentDimensions.forEach((dim) => {
      const categoryIds = assessmentCategories
        .filter((c) => c.dimensionId === dim.id)
        .map((c) => c.id);
      byDimension[dim.id] = questions.filter((q) =>
        categoryIds.includes(q.categoryId)
      ).length;
    });

    const byType: Record<string, number> = {
      behavioral: questions.filter((q) => q.type === 'behavioral').length,
      situational: questions.filter((q) => q.type === 'situational').length,
      self_assessment: questions.filter((q) => q.type === 'self_assessment').length,
    };

    const byLevel: Record<string, number> = {
      basic: questions.filter((q) => q.level === 'basic').length,
      intermediate: questions.filter((q) => q.level === 'intermediate').length,
      advanced: questions.filter((q) => q.level === 'advanced').length,
    };

    return {
      totalQuestions,
      activeQuestions,
      inactiveQuestions,
      byDimension,
      byType: byType as QuestionBankStats['byType'],
      byLevel: byLevel as QuestionBankStats['byLevel'],
    };
  }, [questions]);

  // Actions
  const updateFilters = useCallback((newFilters: Partial<QuestionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset page on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginatedResult.totalPages || 1)));
  }, [paginatedResult.totalPages]);

  const createQuestion = useCallback((data: QuestionFormData): AssessmentQuestion => {
    const newQuestion: AssessmentQuestion = {
      id: `q-custom-${Date.now()}`,
      ...data,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    return newQuestion;
  }, []);

  const updateQuestion = useCallback(
    (id: string, data: Partial<QuestionFormData>): AssessmentQuestion | null => {
      let updatedQuestion: AssessmentQuestion | null = null;

      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === id) {
            updatedQuestion = {
              ...q,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            return updatedQuestion;
          }
          return q;
        })
      );

      return updatedQuestion;
    },
    []
  );

  const toggleQuestionStatus = useCallback((id: string): void => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, isActive: !q.isActive, updatedAt: new Date().toISOString() }
          : q
      )
    );
  }, []);

  const duplicateQuestion = useCallback((id: string): AssessmentQuestion | null => {
    const original = questions.find((q) => q.id === id);
    if (!original) return null;

    const duplicated: AssessmentQuestion = {
      ...original,
      id: `q-dup-${Date.now()}`,
      code: `${original.code}-copia`,
      text: `${original.text} (Cópia)`,
      isActive: false, // Duplicates start inactive
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions((prev) => [...prev, duplicated]);
    return duplicated;
  }, [questions]);

  const getQuestionById = useCallback(
    (id: string): AssessmentQuestion | undefined => {
      return questions.find((q) => q.id === id);
    },
    [questions]
  );

  const getQuestionWithContext = useCallback(
    (id: string) => {
      const question = questions.find((q) => q.id === id);
      if (!question) return null;

      const category = getCategoryById(question.categoryId);
      const dimension = question ? getQuestionDimension(question) : undefined;

      return {
        question,
        category,
        dimension,
      };
    },
    [questions]
  );

  return {
    // Data
    questions: paginatedResult.items,
    allQuestions: filteredQuestions,
    pagination: {
      page: paginatedResult.page,
      pageSize: paginatedResult.pageSize,
      total: paginatedResult.total,
      totalPages: paginatedResult.totalPages,
    },
    stats,

    // Filters
    filters,
    searchTerm,
    setSearchTerm,
    updateFilters,
    clearFilters,

    // Pagination
    goToPage,
    currentPage,

    // CRUD
    createQuestion,
    updateQuestion,
    toggleQuestionStatus,
    duplicateQuestion,
    getQuestionById,
    getQuestionWithContext,
  };
}

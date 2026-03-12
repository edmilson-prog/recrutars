/**
 * Hook for Job Analysis
 * PRD-039: Provides debounced analysis of job form data
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { JobFormData, JobAnalysis } from '@/types/jobAnalyzer';
import { analyzeJob } from '@/lib/jobAnalyzer';

interface UseJobAnalyzerOptions {
  debounceMs?: number;
  enabled?: boolean;
}

interface UseJobAnalyzerReturn {
  analysis: JobAnalysis | null;
  isAnalyzing: boolean;
  score: number;
  criticalCount: number;
  importantCount: number;
  analyze: (formData: JobFormData) => void;
}

const DEFAULT_DEBOUNCE_MS = 500;

const EMPTY_ANALYSIS: JobAnalysis = {
  score: 0,
  maxScore: 100,
  suggestions: [],
  biasDetections: [],
  categoryScores: {
    salary: 0,
    description: 0,
    benefits: 0,
    title: 0,
    requirements: 0,
    competencies: 0,
    workType: 0,
    location: 0,
    bias: 0,
  },
  platformAverage: 62,
};

export function useJobAnalyzer(
  formData: JobFormData | null,
  options: UseJobAnalyzerOptions = {}
): UseJobAnalyzerReturn {
  const { debounceMs = DEFAULT_DEBOUNCE_MS, enabled = true } = options;

  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFormDataRef = useRef<string>('');

  // Manual analyze function
  const analyze = useCallback((data: JobFormData) => {
    if (!enabled) return;

    setIsAnalyzing(true);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const result = analyzeJob(data);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, debounceMs);
  }, [debounceMs, enabled]);

  // Auto-analyze when formData changes
  useEffect(() => {
    if (!formData || !enabled) {
      setAnalysis(null);
      return;
    }

    // Create a serialized version for comparison
    const serialized = JSON.stringify(formData);

    // Skip if data hasn't changed
    if (serialized === lastFormDataRef.current) {
      return;
    }

    lastFormDataRef.current = serialized;
    setIsAnalyzing(true);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const result = analyzeJob(formData);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, debounceMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, debounceMs, enabled]);

  // Computed values
  const score = analysis?.score ?? 0;

  const criticalCount = useMemo(() => {
    return analysis?.suggestions.filter(s => s.severity === 'critical').length ?? 0;
  }, [analysis]);

  const importantCount = useMemo(() => {
    return analysis?.suggestions.filter(s => s.severity === 'important').length ?? 0;
  }, [analysis]);

  return {
    analysis,
    isAnalyzing,
    score,
    criticalCount,
    importantCount,
    analyze,
  };
}

// Helper function to create JobFormData from form state
export function createJobFormData(
  formState: {
    title: string;
    description: string;
    location: string;
    type: '' | 'remote' | 'hybrid' | 'onsite';
    level: string;
    area: string;
    salaryMin: string;
    salaryMax: string;
    salaryNegotiable: boolean;
    requirements: string;
  },
  benefits: string[],
  skills: string[],
  technicalSkillCount: number = 0,
  behavioralSkillCount: number = 0
): JobFormData {
  return {
    title: formState.title,
    description: formState.description,
    location: formState.location,
    type: formState.type,
    level: formState.level,
    area: formState.area,
    salaryMin: formState.salaryMin,
    salaryMax: formState.salaryMax,
    salaryNegotiable: formState.salaryNegotiable,
    requirements: formState.requirements,
    benefits,
    skills,
    technicalSkillCount,
    behavioralSkillCount,
  };
}

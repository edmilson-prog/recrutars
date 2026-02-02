/**
 * Hook: useJobAssessment
 * PRD-048: Teste por Vaga
 *
 * CRUD de testes comportamentais associados a vagas
 */

import { useState, useCallback, useMemo } from 'react';
import {
  mockJobAssessments,
  mockJobAssessmentInvites,
  mockJobAssessmentResults,
  JOB_TEST_CONFIG,
} from '@/data/behavioralAssessmentData';
import type {
  JobAssessment,
  JobAssessmentInvite,
  JobAssessmentResult,
  SelectedCompetencies,
  JobAssessmentStatus,
} from '@/types/assessment';

export interface UseJobAssessmentReturn {
  // Data
  assessments: JobAssessment[];
  invites: JobAssessmentInvite[];
  results: JobAssessmentResult[];

  // CRUD
  getAssessmentByJobId: (jobId: string) => JobAssessment | undefined;
  getAssessmentById: (id: string) => JobAssessment | undefined;
  createAssessment: (data: CreateAssessmentData) => JobAssessment;
  updateAssessment: (id: string, data: Partial<JobAssessment>) => void;
  publishAssessment: (id: string) => void;
  archiveAssessment: (id: string) => void;

  // Invites
  getInvitesByAssessmentId: (assessmentId: string) => JobAssessmentInvite[];
  getResultsByAssessmentId: (assessmentId: string) => JobAssessmentResult[];

  // Config
  config: typeof JOB_TEST_CONFIG;
}

interface CreateAssessmentData {
  jobId: string;
  companyId: string;
  title: string;
  competencies: SelectedCompetencies;
  questionsIds: string[];
  estimatedMinutes: number;
  expirationDays: number;
  createdBy: string;
}

export function useJobAssessment(): UseJobAssessmentReturn {
  const [assessments, setAssessments] = useState<JobAssessment[]>(mockJobAssessments);
  const [invites, setInvites] = useState<JobAssessmentInvite[]>(mockJobAssessmentInvites);
  const [results] = useState<JobAssessmentResult[]>(mockJobAssessmentResults);

  const config = JOB_TEST_CONFIG;

  // Get assessment by job ID
  const getAssessmentByJobId = useCallback(
    (jobId: string): JobAssessment | undefined => {
      return assessments.find((a) => a.jobId === jobId && a.status !== 'archived');
    },
    [assessments]
  );

  // Get assessment by ID
  const getAssessmentById = useCallback(
    (id: string): JobAssessment | undefined => {
      return assessments.find((a) => a.id === id);
    },
    [assessments]
  );

  // Create new assessment
  const createAssessment = useCallback(
    (data: CreateAssessmentData): JobAssessment => {
      const now = new Date().toISOString();
      const newAssessment: JobAssessment = {
        id: `ja-${Date.now()}`,
        ...data,
        status: 'draft',
        totalQuestions: data.questionsIds.length,
        createdAt: now,
        updatedAt: now,
      };

      setAssessments((prev) => [...prev, newAssessment]);
      return newAssessment;
    },
    []
  );

  // Update assessment
  const updateAssessment = useCallback(
    (id: string, data: Partial<JobAssessment>): void => {
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, ...data, updatedAt: new Date().toISOString() }
            : a
        )
      );
    },
    []
  );

  // Publish assessment
  const publishAssessment = useCallback((id: string): void => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'published' as JobAssessmentStatus, updatedAt: new Date().toISOString() }
          : a
      )
    );
  }, []);

  // Archive assessment
  const archiveAssessment = useCallback((id: string): void => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'archived' as JobAssessmentStatus, updatedAt: new Date().toISOString() }
          : a
      )
    );
  }, []);

  // Get invites by assessment ID
  const getInvitesByAssessmentId = useCallback(
    (assessmentId: string): JobAssessmentInvite[] => {
      return invites.filter((i) => i.jobAssessmentId === assessmentId);
    },
    [invites]
  );

  // Get results by assessment ID
  const getResultsByAssessmentId = useCallback(
    (assessmentId: string): JobAssessmentResult[] => {
      return results.filter((r) => r.jobAssessmentId === assessmentId);
    },
    [results]
  );

  return {
    assessments,
    invites,
    results,
    getAssessmentByJobId,
    getAssessmentById,
    createAssessment,
    updateAssessment,
    publishAssessment,
    archiveAssessment,
    getInvitesByAssessmentId,
    getResultsByAssessmentId,
    config,
  };
}

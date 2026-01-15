/**
 * useApplications hook
 * PRD-007: Candidatura a Vagas
 * PRD-009: Adicionado cancelApplication para desistência
 */

import { useState, useCallback } from 'react';
import { mockApplications } from '@/data/mockData';
import type { Application } from '@/types';

export function useApplications(candidateId: string) {
  const [applications, setApplications] = useState<Application[]>(() =>
    mockApplications.filter(app => app.candidateId === candidateId)
  );

  const hasApplied = useCallback((jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  }, [applications]);

  const getApplication = useCallback((jobId: string) => {
    return applications.find(app => app.jobId === jobId);
  }, [applications]);

  const createApplication = useCallback((
    jobId: string,
    jobTitle: string,
    companyName: string,
    candidateName: string,
    message?: string
  ): Application => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId,
      candidateId,
      candidateName,
      jobTitle,
      companyName,
      status: 'pending',
      message,
      appliedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setApplications(prev => [...prev, newApp]);
    mockApplications.push(newApp);
    return newApp;
  }, [candidateId]);

  const cancelApplication = useCallback((applicationId: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: 'withdrawn' as const, updatedAt: new Date().toISOString().split('T')[0] }
          : app
      )
    );
    // Atualizar no mockApplications também
    const appIndex = mockApplications.findIndex(a => a.id === applicationId);
    if (appIndex !== -1) {
      mockApplications[appIndex].status = 'withdrawn';
      mockApplications[appIndex].updatedAt = new Date().toISOString().split('T')[0];
    }
  }, []);

  return {
    applications,
    hasApplied,
    getApplication,
    createApplication,
    cancelApplication,
  };
}

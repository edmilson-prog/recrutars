/**
 * Hook: useMagicLink
 * PRD-048: Teste por Vaga
 *
 * Geração e validação de links mágicos para candidatos externos
 */

import { useState, useCallback } from 'react';
import {
  mockJobAssessmentInvites,
  generateMagicToken,
  validateMagicToken,
  JOB_TEST_CONFIG,
} from '@/data/behavioralAssessmentData';
import type {
  JobAssessmentInvite,
  JobAssessmentInviteStatus,
} from '@/types/assessment';

export interface UseMagicLinkReturn {
  // Data
  invites: JobAssessmentInvite[];

  // Actions
  generateLink: (data: GenerateLinkData) => GenerateLinkResult;
  validateToken: (token: string) => JobAssessmentInvite | null;
  startInvite: (inviteId: string) => void;
  completeInvite: (inviteId: string) => void;
  expireInvite: (inviteId: string) => void;

  // Stats
  getInviteStats: (assessmentId: string) => InviteStats;
}

interface GenerateLinkData {
  jobAssessmentId: string;
  externalName?: string;
  externalEmail?: string;
  expirationDays?: number;
}

interface GenerateLinkResult {
  invite: JobAssessmentInvite;
  magicLink: string;
  success: boolean;
  error?: string;
}

interface InviteStats {
  total: number;
  pending: number;
  started: number;
  completed: number;
  expired: number;
  remaining: number;
}

export function useMagicLink(): UseMagicLinkReturn {
  const [invites, setInvites] = useState<JobAssessmentInvite[]>(mockJobAssessmentInvites);
  const config = JOB_TEST_CONFIG;

  // Gerar novo link mágico
  const generateLink = useCallback(
    (data: GenerateLinkData): GenerateLinkResult => {
      // Verificar limite de links por vaga
      const existingCount = invites.filter(
        (i) => i.jobAssessmentId === data.jobAssessmentId && i.type === 'magic_link'
      ).length;

      if (existingCount >= config.maxMagicLinksPerJob) {
        return {
          invite: {} as JobAssessmentInvite,
          magicLink: '',
          success: false,
          error: `Limite de ${config.maxMagicLinksPerJob} links por vaga atingido`,
        };
      }

      // Gerar token
      const token = generateMagicToken();

      // Calcular expiração
      const expirationDays = data.expirationDays || config.defaultExpirationDays;
      const expiresAt = new Date(
        Date.now() + expirationDays * 24 * 60 * 60 * 1000
      ).toISOString();

      // Criar convite
      const now = new Date().toISOString();
      const newInvite: JobAssessmentInvite = {
        id: `jai-${Date.now()}`,
        jobAssessmentId: data.jobAssessmentId,
        type: 'magic_link',
        externalName: data.externalName,
        externalEmail: data.externalEmail,
        magicToken: token,
        status: 'pending',
        sentAt: now,
        expiresAt,
      };

      setInvites((prev) => [...prev, newInvite]);

      // Construir link
      const baseUrl = window.location.origin;
      const magicLink = `${baseUrl}/t/${token}`;

      return {
        invite: newInvite,
        magicLink,
        success: true,
      };
    },
    [invites, config.maxMagicLinksPerJob, config.defaultExpirationDays]
  );

  // Validar token
  const validateTokenFn = useCallback(
    (token: string): JobAssessmentInvite | null => {
      // Primeiro verificar nos nossos invites locais
      const invite = invites.find(
        (i) =>
          i.magicToken === token &&
          i.status !== 'expired' &&
          new Date(i.expiresAt) > new Date()
      );

      if (invite) return invite;

      // Fallback para mock data
      return validateMagicToken(token);
    },
    [invites]
  );

  // Iniciar convite (candidato começou o teste)
  const startInvite = useCallback((inviteId: string) => {
    setInvites((prev) =>
      prev.map((i) =>
        i.id === inviteId
          ? {
              ...i,
              status: 'started' as JobAssessmentInviteStatus,
              startedAt: new Date().toISOString(),
            }
          : i
      )
    );
  }, []);

  // Completar convite
  const completeInvite = useCallback((inviteId: string) => {
    setInvites((prev) =>
      prev.map((i) =>
        i.id === inviteId
          ? {
              ...i,
              status: 'completed' as JobAssessmentInviteStatus,
              completedAt: new Date().toISOString(),
            }
          : i
      )
    );
  }, []);

  // Expirar convite manualmente
  const expireInvite = useCallback((inviteId: string) => {
    setInvites((prev) =>
      prev.map((i) =>
        i.id === inviteId
          ? {
              ...i,
              status: 'expired' as JobAssessmentInviteStatus,
            }
          : i
      )
    );
  }, []);

  // Estatísticas de convites
  const getInviteStats = useCallback(
    (assessmentId: string): InviteStats => {
      const assessmentInvites = invites.filter(
        (i) => i.jobAssessmentId === assessmentId
      );

      const magicLinkCount = assessmentInvites.filter(
        (i) => i.type === 'magic_link'
      ).length;

      return {
        total: assessmentInvites.length,
        pending: assessmentInvites.filter((i) => i.status === 'pending').length,
        started: assessmentInvites.filter((i) => i.status === 'started').length,
        completed: assessmentInvites.filter((i) => i.status === 'completed').length,
        expired: assessmentInvites.filter((i) => i.status === 'expired').length,
        remaining: config.maxMagicLinksPerJob - magicLinkCount,
      };
    },
    [invites, config.maxMagicLinksPerJob]
  );

  return {
    invites,
    generateLink,
    validateToken: validateTokenFn,
    startInvite,
    completeInvite,
    expireInvite,
    getInviteStats,
  };
}

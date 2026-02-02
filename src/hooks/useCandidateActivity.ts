import { useState, useMemo } from 'react';
import {
  mockApplications,
  mockApplicationNotes,
  mockApplicationHistory,
  mockConversations,
  mockMessages,
} from '@/data/mockData';

export type ActivityType = 'application' | 'status_change' | 'note' | 'message' | 'test_request';

export interface CandidateActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  jobTitle?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Novo',
  reviewing: 'Em Análise',
  interview: 'Entrevista',
  offer: 'Aprovado',
  rejected: 'Reprovado',
  hired: 'Contratado',
  withdrawn: 'Desistência',
};

export function useCandidateActivity(candidateId: string, pageSize = 5) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const allActivities = useMemo(() => {
    const activities: CandidateActivity[] = [];

    // Get all applications for this candidate
    const candidateApps = mockApplications.filter(
      (a) => a.candidateId === candidateId
    );
    const appIds = candidateApps.map((a) => a.id);

    // 1. Application submissions
    for (const app of candidateApps) {
      activities.push({
        id: `activity-app-${app.id}`,
        type: 'application',
        title: 'Candidatura enviada',
        jobTitle: app.jobTitle,
        timestamp: app.appliedAt,
      });
    }

    // 2. Status changes from history
    const relevantHistory = mockApplicationHistory.filter((h) =>
      appIds.includes(h.applicationId)
    );
    for (const hist of relevantHistory) {
      // Skip initial "pending" status (already covered by application submission)
      if (hist.fromStatus === null) continue;

      const app = candidateApps.find((a) => a.id === hist.applicationId);
      activities.push({
        id: `activity-hist-${hist.id}`,
        type: 'status_change',
        title: `Status alterado para ${STATUS_LABELS[hist.toStatus] || hist.toStatus}`,
        description: hist.reason,
        timestamp: hist.changedAt,
        actor: hist.changedBy,
        jobTitle: app?.jobTitle,
      });
    }

    // 3. Notes
    const relevantNotes = mockApplicationNotes.filter((n) =>
      appIds.includes(n.applicationId)
    );
    for (const note of relevantNotes) {
      const app = candidateApps.find((a) => a.id === note.applicationId);
      activities.push({
        id: `activity-note-${note.id}`,
        type: 'note',
        title: 'Anotação adicionada',
        description: note.content,
        timestamp: note.createdAt,
        actor: note.author,
        jobTitle: app?.jobTitle,
      });
    }

    // 4. Messages from conversations
    const candidateConvs = mockConversations.filter(
      (c) => c.candidateId === candidateId
    );
    const convIds = candidateConvs.map((c) => c.id);
    const relevantMessages = mockMessages.filter((m) =>
      convIds.includes(m.conversationId)
    );
    for (const msg of relevantMessages) {
      const conv = candidateConvs.find((c) => c.id === msg.conversationId);
      activities.push({
        id: `activity-msg-${msg.id}`,
        type: 'message',
        title: msg.senderType === 'company' ? 'Mensagem enviada' : 'Mensagem recebida',
        description: msg.subject,
        timestamp: msg.createdAt,
        actor: msg.senderName,
        jobTitle: conv?.jobTitle,
      });
    }

    // 5. Test requests from applications
    for (const app of candidateApps) {
      if (app.testStatus !== 'nao_solicitado' && app.testRequestedAt) {
        activities.push({
          id: `activity-test-${app.id}`,
          type: 'test_request',
          title: app.testStatus === 'realizado' ? 'Teste realizado' : 'Teste solicitado',
          jobTitle: app.jobTitle,
          timestamp: app.testRequestedAt,
        });
      }
    }

    // Sort by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities;
  }, [candidateId]);

  const activities = allActivities.slice(0, visibleCount);
  const hasMore = visibleCount < allActivities.length;
  const remaining = allActivities.length - visibleCount;

  const showMore = () => {
    setVisibleCount((prev) => prev + pageSize);
  };

  return {
    activities,
    hasMore,
    remaining,
    showMore,
    totalCount: allActivities.length,
  };
}

// PRD-033: Hook para gerenciamento de notificações da empresa

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CompanyNotification,
  CompanyNotificationFilter
} from '@/types/companyNotifications';
import { companyFilterToTypes } from '@/types/companyNotifications';

// Mock data de notificações da empresa
const mockCompanyNotifications: CompanyNotification[] = [
  {
    id: 'company-notif-001',
    type: 'new_application',
    title: 'Nova candidatura recebida',
    description: 'Lucas Mendes se candidatou para "Desenvolvedor React Senior"',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
    actionUrl: '/empresa/candidaturas',
    metadata: {
      candidateId: 'cand-001',
      candidateName: 'Lucas Mendes',
      candidatePhoto: '',
      jobId: 'job-001',
      jobTitle: 'Desenvolvedor React Senior',
      matchPercentage: 92,
      discProfile: 'DI',
    },
  },
  {
    id: 'company-notif-002',
    type: 'invite_accepted',
    title: 'Convite aceito',
    description: 'Ana Silva aceitou o convite para "Product Manager"',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    actionUrl: '/empresa/candidatos/cand-002',
    metadata: {
      candidateId: 'cand-002',
      candidateName: 'Ana Silva',
      jobId: 'job-002',
      jobTitle: 'Product Manager',
      matchPercentage: 88,
      discProfile: 'IS',
    },
  },
  {
    id: 'company-notif-003',
    type: 'interview_confirmed',
    title: 'Entrevista confirmada',
    description: 'Pedro Costa confirmou a entrevista para amanhã às 14h',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    actionUrl: '/empresa/agenda',
    metadata: {
      candidateId: 'cand-003',
      candidateName: 'Pedro Costa',
      jobTitle: 'Tech Lead',
      interviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      interviewTime: '14:00',
    },
  },
  {
    id: 'company-notif-004',
    type: 'new_message',
    title: 'Nova mensagem',
    description: 'Mariana Oliveira enviou uma mensagem',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    actionUrl: '/empresa/mensagens',
    metadata: {
      candidateId: 'cand-004',
      candidateName: 'Mariana Oliveira',
      messagePreview: 'Gostaria de saber mais sobre as responsabilidades da vaga...',
    },
  },
  {
    id: 'company-notif-005',
    type: 'test_completed',
    title: 'Teste concluído',
    description: 'Felipe Santos completou o teste comportamental',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    actionUrl: '/empresa/testes',
    metadata: {
      candidateId: 'cand-005',
      candidateName: 'Felipe Santos',
      jobTitle: 'Desenvolvedor Full Stack',
      testScore: 85,
      discProfile: 'DC',
    },
  },
  {
    id: 'company-notif-006',
    type: 'interview_suggested',
    title: 'Novo horário sugerido',
    description: 'Carolina Lima sugeriu outro horário para entrevista',
    read: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 dia e 2h atrás
    actionUrl: '/empresa/agenda',
    metadata: {
      candidateId: 'cand-006',
      candidateName: 'Carolina Lima',
      jobTitle: 'UX Designer',
      suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      suggestedTime: '10:00',
    },
  },
  {
    id: 'company-notif-007',
    type: 'job_expiring',
    title: 'Vaga expirando em breve',
    description: '"Analista de Dados" expira em 3 dias',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    actionUrl: '/empresa/vagas',
    metadata: {
      jobId: 'job-003',
      jobTitle: 'Analista de Dados',
      daysRemaining: 3,
    },
  },
  {
    id: 'company-notif-008',
    type: 'invite_declined',
    title: 'Convite recusado',
    description: 'Roberto Almeida recusou o convite para "DevOps Engineer"',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    actionUrl: '/empresa/candidatos/cand-007',
    metadata: {
      candidateId: 'cand-007',
      candidateName: 'Roberto Almeida',
      jobId: 'job-004',
      jobTitle: 'DevOps Engineer',
    },
  },
  {
    id: 'company-notif-009',
    type: 'interview_cancelled',
    title: 'Entrevista cancelada',
    description: 'Juliana Ferreira cancelou a entrevista agendada',
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 dias atrás
    actionUrl: '/empresa/candidaturas',
    metadata: {
      candidateId: 'cand-008',
      candidateName: 'Juliana Ferreira',
      jobTitle: 'Product Designer',
    },
  },
  {
    id: 'company-notif-010',
    type: 'job_expired',
    title: 'Vaga expirada',
    description: '"Backend Developer" expirou',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
    actionUrl: '/empresa/vagas',
    metadata: {
      jobId: 'job-005',
      jobTitle: 'Backend Developer',
    },
  },
  {
    id: 'company-notif-011',
    type: 'new_application',
    title: 'Nova candidatura recebida',
    description: 'Thiago Souza se candidatou para "Analista de Dados"',
    read: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 dias atrás
    actionUrl: '/empresa/candidaturas',
    metadata: {
      candidateId: 'cand-009',
      candidateName: 'Thiago Souza',
      jobId: 'job-003',
      jobTitle: 'Analista de Dados',
      matchPercentage: 76,
      discProfile: 'CS',
    },
  },
  {
    id: 'company-notif-012',
    type: 'new_message',
    title: 'Nova mensagem',
    description: 'Camila Rodrigues enviou uma mensagem',
    read: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 dias atrás
    actionUrl: '/empresa/mensagens',
    metadata: {
      candidateId: 'cand-010',
      candidateName: 'Camila Rodrigues',
      messagePreview: 'Agradeço pelo feedback da entrevista...',
    },
  },
];

const STORAGE_KEY = 'recrutars_company_notifications_read';

// Helper para carregar IDs de notificações lidas do localStorage
function loadReadIds(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Erro ao carregar notificações lidas:', error);
  }
  return new Set();
}

// Helper para salvar IDs de notificações lidas no localStorage
function saveReadIds(readIds: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readIds)));
  } catch (error) {
    console.error('Erro ao salvar notificações lidas:', error);
  }
}

export function useCompanyNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  // Sincronizar com localStorage quando readIds muda
  useEffect(() => {
    saveReadIds(readIds);
  }, [readIds]);

  // Notificações com estado de leitura atualizado
  const notifications = useMemo(() => {
    return mockCompanyNotifications.map((notif) => ({
      ...notif,
      read: readIds.has(notif.id) || notif.read,
    }));
  }, [readIds]);

  // Contador de não lidas
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Marcar uma notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setReadIds((current) => {
      const newSet = new Set(current);
      newSet.add(notificationId);
      return newSet;
    });
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const newSet = new Set(current);
      mockCompanyNotifications.forEach((n) => newSet.add(n.id));
      return newSet;
    });
  }, []);

  // Verificar se uma notificação está lida
  const isRead = useCallback(
    (notificationId: string): boolean => {
      return readIds.has(notificationId);
    },
    [readIds]
  );

  // Obter notificações filtradas
  const getFilteredNotifications = useCallback(
    (filter: CompanyNotificationFilter): CompanyNotification[] => {
      const types = companyFilterToTypes[filter];
      if (!types) return notifications;
      return notifications.filter((n) => types.includes(n.type));
    },
    [notifications]
  );

  // Obter últimas N notificações
  const getLatestNotifications = useCallback(
    (count: number): CompanyNotification[] => {
      return notifications.slice(0, count);
    },
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isRead,
    getFilteredNotifications,
    getLatestNotifications,
  };
}

// Helper para formatar tempo relativo
export function formatCompanyTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Agora';
  } else if (diffMins < 60) {
    return `há ${diffMins} min`;
  } else if (diffHours < 24) {
    return `há ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'há 1 dia';
  } else if (diffDays < 7) {
    return `há ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

// Helper para agrupar notificações por data
export function groupCompanyNotificationsByDate(notifications: CompanyNotification[]): {
  label: string;
  notifications: CompanyNotification[];
}[] {
  const groups: Map<string, CompanyNotification[]> = new Map();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const notif of notifications) {
    const date = new Date(notif.createdAt);
    let label: string;

    if (date >= today) {
      label = 'Hoje';
    } else if (date >= yesterday) {
      label = 'Ontem';
    } else if (date >= weekAgo) {
      label = 'Esta semana';
    } else if (date >= monthAgo) {
      label = 'Este mês';
    } else {
      label = 'Anteriores';
    }

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(notif);
  }

  // Retornar em ordem
  const order = ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Anteriores'];
  return order
    .filter((label) => groups.has(label))
    .map((label) => ({
      label,
      notifications: groups.get(label)!,
    }));
}

// PRD-025: Hook para gerenciamento de notificações

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Notification, NotificationType, NotificationFilter } from '@/types/notifications';
import { filterToTypes } from '@/types/notifications';

// Mock data de notificações
const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'job_match',
    title: 'Nova vaga compatível',
    description: '"Desenvolvedor React Senior" na TechCorp',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    actionUrl: '/candidato/vagas/job-001',
    metadata: {
      jobId: 'job-001',
      jobTitle: 'Desenvolvedor React Senior',
      companyName: 'TechCorp',
      matchPercentage: 85,
    },
  },
  {
    id: 'notif-002',
    type: 'application_update',
    title: 'Candidatura atualizada',
    description: 'Você avançou para "Entrevista"',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    actionUrl: '/candidato/candidaturas',
    metadata: {
      applicationId: 'app-001',
      jobTitle: 'Product Manager',
      companyName: 'StartupXYZ',
      newStage: 'Entrevista',
    },
  },
  {
    id: 'notif-003',
    type: 'test_request',
    title: 'Teste comportamental solicitado',
    description: 'TechCorp solicita que você realize o teste',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    actionUrl: '/candidato/testes',
    metadata: {
      companyName: 'TechCorp',
      jobTitle: 'Desenvolvedor React Senior',
      testDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 dias restantes
    },
  },
  {
    id: 'notif-004',
    type: 'message',
    title: 'Nova mensagem',
    description: 'BigCorp enviou uma mensagem',
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    actionUrl: '/candidato/mensagens',
    metadata: {
      companyName: 'BigCorp',
      messagePreview: 'Gostaríamos de agendar uma entrevista...',
    },
  },
  {
    id: 'notif-005',
    type: 'application_approved',
    title: 'Parabéns! Você foi aprovado!',
    description: 'Sua candidatura para "Analista de Dados" foi aprovada',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    actionUrl: '/candidato/candidaturas',
    metadata: {
      applicationId: 'app-002',
      jobTitle: 'Analista de Dados',
      companyName: 'DataTech',
    },
  },
  {
    id: 'notif-006',
    type: 'job_match',
    title: 'Nova vaga compatível',
    description: '"Frontend Developer" na WebAgency',
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 dias atrás
    actionUrl: '/candidato/vagas/job-002',
    metadata: {
      jobId: 'job-002',
      jobTitle: 'Frontend Developer',
      companyName: 'WebAgency',
      matchPercentage: 78,
    },
  },
  {
    id: 'notif-007',
    type: 'application_rejected',
    title: 'Processo encerrado',
    description: 'Sua candidatura para "Tech Lead" não avançou',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
    actionUrl: '/candidato/candidaturas',
    metadata: {
      applicationId: 'app-003',
      jobTitle: 'Tech Lead',
      companyName: 'StartupXYZ',
    },
  },
  {
    id: 'notif-008',
    type: 'message',
    title: 'Nova mensagem',
    description: 'TechCorp enviou uma mensagem',
    read: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 dias atrás
    actionUrl: '/candidato/mensagens',
    metadata: {
      companyName: 'TechCorp',
      messagePreview: 'Obrigado pelo interesse em nossa vaga...',
    },
  },
];

const STORAGE_KEY = 'recrutars_notifications_read';

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

export function useNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  // Sincronizar com localStorage quando readIds muda
  useEffect(() => {
    saveReadIds(readIds);
  }, [readIds]);

  // Notificações com estado de leitura atualizado
  const notifications = useMemo(() => {
    return mockNotifications.map((notif) => ({
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
      mockNotifications.forEach((n) => newSet.add(n.id));
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
    (filter: NotificationFilter): Notification[] => {
      const types = filterToTypes[filter];
      if (!types) return notifications;
      return notifications.filter((n) => types.includes(n.type));
    },
    [notifications]
  );

  // Obter últimas N notificações
  const getLatestNotifications = useCallback(
    (count: number): Notification[] => {
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
export function formatTimeAgo(dateStr: string): string {
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
export function groupNotificationsByDate(notifications: Notification[]): {
  label: string;
  notifications: Notification[];
}[] {
  const groups: Map<string, Notification[]> = new Map();
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

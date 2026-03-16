// Templates pre-definidos para notificacoes manuais do admin

import type { NotificationCategory, NotificationPriority } from '@/types/notificationSends';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  actionUrl?: string;
}

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'maintenance',
    name: 'Manutenção Programada',
    title: 'Manutenção programada na plataforma',
    description: 'A plataforma RecrutaRS passará por manutenção programada. Durante este período, alguns serviços podem ficar temporariamente indisponíveis. Pedimos desculpas pelo inconveniente.',
    category: 'alerta',
    priority: 'alta',
  },
  {
    id: 'new_feature',
    name: 'Nova Funcionalidade',
    title: 'Nova funcionalidade disponível!',
    description: 'Temos novidades! Uma nova funcionalidade foi adicionada à plataforma para melhorar sua experiência. Confira as novidades.',
    category: 'informativo',
    priority: 'media',
  },
  {
    id: 'terms_update',
    name: 'Atualização de Termos',
    title: 'Atualização nos Termos de Uso',
    description: 'Nossos Termos de Uso foram atualizados. Por favor, revise as alterações. O uso contínuo da plataforma implica na aceitação dos novos termos.',
    category: 'operacional',
    priority: 'alta',
  },
  {
    id: 'welcome',
    name: 'Boas-vindas',
    title: 'Bem-vindo(a) à RecrutaRS!',
    description: 'É um prazer ter você conosco! Complete seu perfil para aproveitar ao máximo a plataforma e encontrar as melhores oportunidades.',
    category: 'informativo',
    priority: 'baixa',
  },
  {
    id: 'profile_verification',
    name: 'Verificação de Perfil',
    title: 'Verifique seu perfil',
    description: 'Notamos que seu perfil está incompleto. Complete suas informações para aumentar sua visibilidade e receber recomendações mais precisas.',
    category: 'operacional',
    priority: 'media',
  },
  {
    id: 'system_update',
    name: 'Atualização do Sistema',
    title: 'Atualização da plataforma concluída',
    description: 'A plataforma foi atualizada com melhorias de desempenho e novas funcionalidades. Tudo já está funcionando normalmente.',
    category: 'informativo',
    priority: 'baixa',
  },
];

// Central de Gerenciamento de Notificacoes (Admin)

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { NotificationStatsCards } from '@/components/admin/notifications/NotificationStatsCards';
import { NotificationSendsFilters } from '@/components/admin/notifications/NotificationSendsFilters';
import { NotificationSendsTable } from '@/components/admin/notifications/NotificationSendsTable';
import { CreateNotificationDialog } from '@/components/admin/notifications/CreateNotificationDialog';
import {
  useNotificationSends,
  useNotificationSendsStats,
  useSendManualNotification,
  useCancelNotification,
} from '@/hooks/useNotificationSendsQuery';
import type {
  NotificationSendsFilters as FiltersType,
  NotificationSend,
  CreateNotificationParams,
} from '@/types/notificationSends';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FiltersType>({});
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<CreateNotificationParams> | undefined>();

  const { data: notifications = [] } = useNotificationSends(filters);
  const { data: stats = { total: 0, scheduled: 0, successful: 0, manual: 0 } } = useNotificationSendsStats();
  const sendMutation = useSendManualNotification();
  const cancelMutation = useCancelNotification();

  // Quick-filter from stats cards
  const handleStatFilterClick = useCallback((filter: string | null) => {
    setActiveStatFilter(prev => prev === filter ? null : filter);
    if (filter === activeStatFilter) {
      setFilters(prev => ({ ...prev, status: '' }));
    } else if (filter === 'scheduled') {
      setFilters(prev => ({ ...prev, status: 'scheduled' }));
    } else if (filter === 'successful') {
      setFilters(prev => ({ ...prev, status: 'sent' }));
    } else {
      setFilters(prev => ({ ...prev, status: '' }));
    }
  }, [activeStatFilter]);

  const handleSend = useCallback(async (params: CreateNotificationParams) => {
    await sendMutation.mutateAsync(params);
    setDialogOpen(false);
    setDefaultValues(undefined);
  }, [sendMutation]);

  const handleDuplicate = useCallback((notification: NotificationSend) => {
    setDefaultValues({
      title: notification.title,
      description: notification.description,
      actionUrl: notification.actionUrl ?? undefined,
      category: notification.category,
      priority: notification.priority,
      targetType: notification.targetType,
      targetUserId: notification.targetUserId ?? undefined,
      channel: notification.channel,
    });
    setDialogOpen(true);
  }, []);

  const handleCancel = useCallback((id: string) => {
    cancelMutation.mutate(id);
  }, [cancelMutation]);

  const handleOpenCreate = useCallback(() => {
    setDefaultValues(undefined);
    setDialogOpen(true);
  }, []);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Tabs de navegação */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => navigate('/admin/notificacoes')}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Recebidas
          </button>
          <button
            className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Central de Envio
          </button>
          <button
            onClick={() => navigate('/admin/notificacoes/whatsapp')}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            WhatsApp
          </button>
        </div>

        <PageHeader
          title="Central de Notificações"
          description="Gerencie, envie e monitore notificações para os usuários da plataforma"
          actions={
            <Button size="sm" onClick={handleOpenCreate}>
              <Send className="w-4 h-4 mr-2" />
              Nova Notificação
            </Button>
          }
          howItWorks={[
            'Envie notificações manuais para usuários ou grupos',
            'Monitore métricas de envio e leitura',
            'Use templates para agilizar o envio',
            'Agende notificações para envio futuro',
          ]}
        />

        {/* Stats Cards */}
        <NotificationStatsCards
          stats={stats}
          activeFilter={activeStatFilter}
          onFilterClick={handleStatFilterClick}
        />

        {/* Filters */}
        <NotificationSendsFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Table */}
        <NotificationSendsTable
          notifications={notifications}
          onDuplicate={handleDuplicate}
          onCancel={handleCancel}
        />

        {/* Create Dialog */}
        <CreateNotificationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultValues={defaultValues}
          onSend={handleSend}
          isSending={sendMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}

// Página completa de notificações do administrador

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Filter, Send, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminNotificationItem } from '@/components/notifications/AdminNotificationItem';
import { useAuth } from '@/contexts/AuthContext';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotificationsQuery';
import { groupNotificationsByDate } from '@/lib/notificationHelpers';
import type { AdminNotification } from '@/types/adminNotifications';
import type { AdminNotificationFilter } from '@/types/adminNotifications';
import { adminFilterLabels, adminFilterToTypes } from '@/types/adminNotifications';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [filter, setFilter] = useState<AdminNotificationFilter>('all');

  const { data: rawNotifications = [] } = useNotifications(userId);
  const notifications = rawNotifications as unknown as AdminNotification[];
  const { data: unreadCount = 0 } = useNotificationUnreadCount(userId);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => adminFilterToTypes[filter]?.includes(n.type));
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ id, userId });
  };

  const handleMarkAllAsRead = () => {
    markAllMutation.mutate(userId);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Tabs de navegação */}
        <div className="flex gap-1 border-b">
          <button
            className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary"
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Recebidas
          </button>
          <button
            onClick={() => navigate('/admin/notificacoes/central')}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Header */}
        <PageHeader
          title="Notificações"
          description={
            unreadCount > 0
              ? `Você tem ${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''} não lida${unreadCount !== 1 ? 's' : ''}`
              : 'Todas as notificações foram lidas'
          }
          actions={
            <>
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as AdminNotificationFilter)}
              >
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(adminFilterLabels) as AdminNotificationFilter[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {adminFilterLabels[key]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="whitespace-nowrap"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
            </>
          }
          howItWorks={[
            'Central de notificações do administrador',
            'Filtre por tipo de notificação',
            'Marque como lidas individualmente ou todas de uma vez',
          ]}
        />

        {/* Lista de notificações agrupadas */}
        {groupedNotifications.length > 0 ? (
          <div className="space-y-6">
            {groupedNotifications.map((group) => (
              <Card key={group.label}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {group.label}
                    <Badge variant="secondary" className="text-xs">
                      {group.notifications.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {group.notifications.map((notification) => (
                      <AdminNotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter !== 'all'
                  ? 'Tente ajustar o filtro para ver mais notificações.'
                  : 'Você receberá notificações sobre novos cadastros, vagas pendentes e tickets de suporte aqui.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resumo de tipos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Sobre as notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Novas empresas
                  </p>
                  <p className="text-muted-foreground">
                    Empresas que se cadastraram na plataforma
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Novos candidatos
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que se cadastraram na plataforma
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Vagas pendentes
                  </p>
                  <p className="text-muted-foreground">
                    Vagas aguardando aprovação de moderação
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Novos tickets
                  </p>
                  <p className="text-muted-foreground">
                    Tickets de suporte abertos por usuários
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Respostas em tickets
                  </p>
                  <p className="text-muted-foreground">
                    Novas mensagens de usuários em tickets abertos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Falhas de pagamento
                  </p>
                  <p className="text-muted-foreground">
                    Problemas com pagamentos e assinaturas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

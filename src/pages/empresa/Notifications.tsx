// PRD-033: Página completa de notificações da empresa

import { useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
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
import { CompanyNotificationItem } from '@/components/notifications/CompanyNotificationItem';
import { useAuth } from '@/contexts/AuthContext';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotificationsQuery';
import { groupNotificationsByDate } from '@/lib/notificationHelpers';
import type { CompanyNotification } from '@/types/companyNotifications';
import type { CompanyNotificationFilter } from '@/types/companyNotifications';
import { companyFilterLabels, companyFilterToTypes } from '@/types/companyNotifications';

export default function Notifications() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [filter, setFilter] = useState<CompanyNotificationFilter>('all');

  const { data: rawNotifications = [] } = useNotifications(userId);
  const notifications = rawNotifications as unknown as CompanyNotification[];
  const { data: unreadCount = 0 } = useNotificationUnreadCount(userId);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => companyFilterToTypes[filter]?.includes(n.type));
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ id, userId });
  };

  const handleMarkAllAsRead = () => {
    markAllMutation.mutate(userId);
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
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
                onValueChange={(value) => setFilter(value as CompanyNotificationFilter)}
              >
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(companyFilterLabels) as CompanyNotificationFilter[]).map(
                    (key) => (
                      <SelectItem key={key} value={key}>
                        {companyFilterLabels[key]}
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
            'Central de notificacoes da empresa',
            'Filtre por tipo de notificacao',
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
                      <CompanyNotificationItem
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
                  : 'Você receberá notificações sobre candidaturas, entrevistas e mensagens aqui.'}
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
                    Novas candidaturas
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que se aplicaram às suas vagas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Convites aceitos
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que aceitaram seu convite
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Entrevistas confirmadas
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que confirmaram a entrevista
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Novos horários sugeridos
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que sugeriram outro horário
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500" />
                <div>
                  <p className="font-medium text-foreground">Mensagens</p>
                  <p className="text-muted-foreground">
                    Novas mensagens de candidatos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Testes concluídos
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que completaram o teste comportamental
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Vagas expirando
                  </p>
                  <p className="text-muted-foreground">
                    Vagas que irão expirar em breve
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Convites recusados / Cancelamentos
                  </p>
                  <p className="text-muted-foreground">
                    Candidatos que recusaram ou cancelaram
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

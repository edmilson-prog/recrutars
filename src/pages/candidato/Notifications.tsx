// PRD-025: Página completa de notificações do candidato

import { useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { NotificationItem } from '@/components/notifications';
import {
  useNotifications,
  groupNotificationsByDate,
} from '@/hooks/useNotifications';
import type { NotificationFilter } from '@/types/notifications';
import { filterLabels } from '@/types/notifications';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const {
    unreadCount,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
  } = useNotifications();

  const filteredNotifications = getFilteredNotifications(filter);
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `Você tem ${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''} não lida${unreadCount !== 1 ? 's' : ''}`
                : 'Todas as notificações foram lidas'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtro */}
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as NotificationFilter)}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(filterLabels) as NotificationFilter[]).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {filterLabels[key]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {/* Marcar todas como lidas */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="whitespace-nowrap"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

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
                      <NotificationItem
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
                  : 'Você receberá notificações sobre vagas, candidaturas e mensagens aqui.'}
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
                <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Vagas compatíveis
                  </p>
                  <p className="text-muted-foreground">
                    Novas vagas que combinam com seu perfil
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Atualizações de candidatura
                  </p>
                  <p className="text-muted-foreground">
                    Mudanças de status nas suas candidaturas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Testes solicitados
                  </p>
                  <p className="text-muted-foreground">
                    Empresas que pedem seu teste comportamental
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium text-foreground">Mensagens</p>
                  <p className="text-muted-foreground">
                    Novas mensagens de empresas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-foreground">Aprovações</p>
                  <p className="text-muted-foreground">
                    Quando você é aprovado em um processo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-foreground">
                    Processos encerrados
                  </p>
                  <p className="text-muted-foreground">
                    Quando uma candidatura não avança
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

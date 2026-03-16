// Componente de sino de notificações para admin

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotificationsQuery';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import type { AdminNotification } from '@/types/adminNotifications';
import { AdminNotificationItem } from './AdminNotificationItem';
import { cn } from '@/lib/utils';

interface AdminNotificationBellProps {
  className?: string;
}

export function AdminNotificationBell({ className }: AdminNotificationBellProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [open, setOpen] = useState(false);

  useRealtimeNotifications(userId);
  const { data: rawNotifications = [] } = useNotifications(userId);
  const notifications = rawNotifications as unknown as AdminNotification[];
  const { data: unreadCount = 0 } = useNotificationUnreadCount(userId);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const latestNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (id: string) => {
    markAsReadMutation.mutate({ id, userId });
    setOpen(false);
  };

  const handleMarkSingleAsRead = (id: string) => {
    markAsReadMutation.mutate({ id, userId });
  };

  const handleMarkAllAsRead = () => {
    markAllMutation.mutate(userId);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/admin/notificacoes');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-xs bg-destructive text-destructive-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Lista de notificações */}
        {latestNotifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y">
              {latestNotifications.map((notification) => (
                <AdminNotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleNotificationClick}
                  onMarkAsRead={handleMarkSingleAsRead}
                  compact
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Você não tem notificações
            </p>
          </div>
        )}

        {/* Footer */}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm text-muted-foreground hover:text-foreground"
            onClick={handleViewAll}
          >
            Ver todas as notificações
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

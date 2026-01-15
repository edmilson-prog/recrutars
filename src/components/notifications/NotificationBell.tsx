// PRD-025: Componente de sino de notificações com dropdown

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unreadCount, getLatestNotifications, markAsRead, markAllAsRead } =
    useNotifications();

  const latestNotifications = getLatestNotifications(5);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/candidato/notificacoes');
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
          <ScrollArea className="max-h-96">
            <div className="divide-y">
              {latestNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleNotificationClick}
                  compact
                />
              ))}
            </div>
          </ScrollArea>
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

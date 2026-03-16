/**
 * NotificationSendsTable
 * Data table displaying notification sends with columns for date, title,
 * recipient, category, priority, status, sender, and actions.
 */

import { useMemo } from 'react';
import { MoreHorizontal, Copy, XCircle, Inbox } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { NotificationSend } from '@/types/notificationSends';
import {
  categoryLabels,
  priorityLabels,
  statusLabels,
  targetTypeLabels,
  categoryColors,
  priorityColors,
  statusColors,
} from '@/types/notificationSends';

interface NotificationSendsTableProps {
  notifications: NotificationSend[];
  onDuplicate: (notification: NotificationSend) => void;
  onCancel: (id: string) => void;
}

function formatDateBR(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRecipientLabel(notification: NotificationSend): string {
  if (notification.targetType === 'specific_user' && notification.targetUserName) {
    return notification.targetUserName;
  }
  return targetTypeLabels[notification.targetType];
}

export function NotificationSendsTable({
  notifications,
  onDuplicate,
  onCancel,
}: NotificationSendsTableProps) {
  // Sort by date descending (most recent first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [notifications]);

  if (sortedNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Nenhuma notificacao encontrada
        </p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou crie uma nova notificacao.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Data</TableHead>
            <TableHead className="min-w-[180px]">Titulo</TableHead>
            <TableHead className="min-w-[160px]">Destinatario</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enviado por</TableHead>
            <TableHead className="w-[60px]">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedNotifications.map((notification) => (
            <TableRow key={notification.id}>
              {/* Data */}
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDateBR(notification.sentAt ?? notification.createdAt)}
              </TableCell>

              {/* Titulo */}
              <TableCell>
                <span className="text-sm font-medium line-clamp-1">
                  {notification.title}
                </span>
              </TableCell>

              {/* Destinatario */}
              <TableCell className="text-sm">
                {getRecipientLabel(notification)}
              </TableCell>

              {/* Categoria */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    categoryColors[notification.category],
                  )}
                >
                  {categoryLabels[notification.category]}
                </Badge>
              </TableCell>

              {/* Prioridade */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    priorityColors[notification.priority],
                  )}
                >
                  {priorityLabels[notification.priority]}
                </Badge>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    statusColors[notification.status],
                  )}
                >
                  {statusLabels[notification.status]}
                </Badge>
              </TableCell>

              {/* Enviado por */}
              <TableCell className="text-sm text-muted-foreground">
                {notification.sentByName ?? notification.sentBy}
              </TableCell>

              {/* Acoes */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Acoes</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDuplicate(notification)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    {notification.status === 'scheduled' && (
                      <DropdownMenuItem
                        onClick={() => onCancel(notification.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

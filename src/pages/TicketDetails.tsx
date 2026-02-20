/**
 * TicketDetails Page
 * PRD-028: Central de Ajuda - Ticket Details and Conversation
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TicketThread } from '@/components/help/TicketThread';
import { TicketReply } from '@/components/help/TicketReply';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';
import {
  ticketCategoryLabels,
  ticketStatusLabels,
  ticketStatusColors,
} from '@/types/help';

function TicketDetailsContent() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResolving, setIsResolving] = useState(false);

  const { getTicketById, addMessage, markAsResolved } = useTickets(user?.id || '');

  const ticket = ticketId ? getTicketById(ticketId) : undefined;

  useEffect(() => {
    if (!ticket) {
      toast({
        title: 'Ticket não encontrado',
        description: 'O ticket que você está procurando não existe.',
        variant: 'destructive',
      });
      navigate('/ajuda');
    }
  }, [ticket, navigate, toast]);

  if (!ticket) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const handleSendReply = async (
    content: string,
    attachment?: { url: string; name: string }
  ) => {
    addMessage(ticket.id, content, attachment);
  };

  const handleMarkAsResolved = async () => {
    setIsResolving(true);
    try {
      markAsResolved(ticket.id);
      toast({
        title: 'Ticket resolvido!',
        description: 'O ticket foi marcado como resolvido.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao resolver ticket',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const statusColorMap: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusColor =
    statusColorMap[ticketStatusColors[ticket.status]] ?? statusColorMap.gray;

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/ajuda')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Central de Ajuda
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Ticket #{ticket.number}
              </h1>
              <Badge variant="outline" className={statusColor}>
                {ticketStatusLabels[ticket.status]}
              </Badge>
              <Badge variant="secondary">
                {ticketCategoryLabels[ticket.category]}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-foreground/90">
              {ticket.subject}
            </h2>
          </div>

          {!isResolved && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isResolving}>
                  <Check className="mr-2 h-4 w-4" />
                  Marcar como Resolvido
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Marcar ticket como resolvido?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso indicará que seu problema foi solucionado. Você não poderá mais
                    adicionar respostas a este ticket após marcá-lo como resolvido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkAsResolved}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Thread de mensagens */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-6">
        <TicketThread messages={ticket.messages} />
      </div>

      {/* Formulário de resposta */}
      {!isResolved && <TicketReply onSendReply={handleSendReply} />}

      {isResolved && (
        <div className="rounded-lg border border-border/50 bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Este ticket está resolvido. Caso precise de mais ajuda, crie um novo ticket.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TicketDetailsPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout userType={user.type}>
      <TicketDetailsContent />
    </DashboardLayout>
  );
}

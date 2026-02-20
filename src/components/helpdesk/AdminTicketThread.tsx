/**
 * AdminTicketThread Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Chronological thread with messages + internal notes.
 */

import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { AdminThreadMessage } from './AdminThreadMessage';
import type { TicketMessage } from '@/types/help';

interface AdminTicketThreadProps {
  messages: TicketMessage[];
}

export function AdminTicketThread({ messages }: AdminTicketThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">Nenhuma mensagem neste ticket.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <AdminThreadMessage key={message.id} message={message} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

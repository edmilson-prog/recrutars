/**
 * Chatbot Escalation Form Component
 * PRD-040: Chatbot de Suporte
 *
 * Form to escalate to human support
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ChatbotEscalationProps {
  onSubmit: (subject: string, description: string, email?: string) => void;
  onCancel: () => void;
  userEmail?: string;
}

export function ChatbotEscalation({
  onSubmit,
  onCancel,
  userEmail,
}: ChatbotEscalationProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(userEmail || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    onSubmit(subject.trim(), description.trim(), email || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 border-t border-border bg-muted/30"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Headphones className="w-4 h-4 text-primary" />
            Falar com Suporte
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!userEmail && (
          <div className="space-y-1">
            <Label htmlFor="escalation-email" className="text-xs">
              Seu email
            </Label>
            <Input
              id="escalation-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-9 text-sm"
            />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="escalation-subject" className="text-xs">
            Assunto *
          </Label>
          <Input
            id="escalation-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Resumo do problema"
            className="h-9 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="escalation-description" className="text-xs">
            Descrição *
          </Label>
          <Textarea
            id="escalation-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva seu problema em detalhes..."
            rows={3}
            className="text-sm resize-none"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!subject.trim() || !description.trim()}
            className="flex-1 gap-1"
          >
            <Send className="w-3 h-3" />
            Enviar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          O histórico desta conversa será incluído no ticket.
        </p>
      </form>
    </motion.div>
  );
}

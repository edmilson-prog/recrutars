/**
 * TicketReply Component
 * PRD-028: Central de Ajuda - Reply to Ticket
 */

import { useState } from 'react';
import { Paperclip, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TicketReplyProps {
  onSendReply: (
    content: string,
    attachment?: { url: string; name: string }
  ) => Promise<void>;
  disabled?: boolean;
}

export function TicketReply({ onSendReply, disabled }: TicketReplyProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo não permitido',
        description: 'Apenas arquivos PNG, JPG e PDF são permitidos.',
        variant: 'destructive',
      });
      return;
    }

    // Converter para base64 (mock)
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        url: reader.result as string,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: 'Mensagem vazia',
        description: 'Digite uma mensagem antes de enviar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendReply(message, attachment || undefined);
      setMessage('');
      setAttachment(null);
      toast({
        title: 'Resposta enviada!',
        description: 'Sua mensagem foi adicionada ao ticket.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar resposta',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card p-6">
      <h3 className="font-semibold text-foreground">Adicionar Resposta</h3>

      {/* Textarea */}
      <Textarea
        placeholder="Digite sua resposta..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled || isSubmitting}
        className="min-h-[120px] resize-none"
      />

      {/* Anexo Preview */}
      {attachment && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">{attachment.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAttachment}
            disabled={disabled || isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <input
            type="file"
            id="reply-attachment"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            disabled={disabled || isSubmitting || !!attachment}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('reply-attachment')?.click()}
            disabled={disabled || isSubmitting || !!attachment}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Anexar Arquivo
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={disabled || isSubmitting}>
          {isSubmitting ? (
            'Enviando...'
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar Resposta
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: PNG, JPG, PDF (máx. 5MB)
      </p>
    </div>
  );
}

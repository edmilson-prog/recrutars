/**
 * Email Invite Form
 * PRD-052: Convite por email
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/utils/auditLog';

interface EmailInviteFormProps {
  testId: string;
  testName: string;
}

export function EmailInviteForm({ testId, testName }: EmailInviteFormProps) {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Email inválido', variant: 'destructive' });
      return;
    }
    if (emails.includes(email)) {
      toast({ title: 'Email já adicionado', variant: 'destructive' });
      return;
    }
    setEmails(prev => [...prev, email]);
    setEmailInput('');
  };

  const removeEmail = (email: string) => {
    setEmails(prev => prev.filter(e => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleSend = () => {
    if (emails.length === 0) {
      toast({ title: 'Adicione pelo menos um email', variant: 'destructive' });
      return;
    }
    emails.forEach(email => {
      addAuditLog('invite_sent', 'user-comp-1', 'Maria Recrutadora', 'invitation', `inv-${Date.now()}`, email, `Teste: ${testName}`);
    });
    toast({
      title: 'Convites enviados',
      description: `${emails.length} convite${emails.length > 1 ? 's' : ''} enviado${emails.length > 1 ? 's' : ''} com sucesso.`,
    });
    setEmails([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Emails dos candidatos</Label>
        <div className="flex gap-2">
          <Input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite o email e pressione Enter"
          />
          <Button variant="outline" onClick={addEmail}>Adicionar</Button>
        </div>
      </div>

      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emails.map(email => (
            <Badge key={email} variant="secondary" className="pl-2 pr-1 py-1">
              {email}
              <button
                onClick={() => removeEmail(email)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Button onClick={handleSend} disabled={emails.length === 0}>
        <Send className="h-4 w-4 mr-2" />
        Enviar {emails.length > 0 ? `${emails.length} convite${emails.length > 1 ? 's' : ''}` : 'convites'}
      </Button>
    </div>
  );
}

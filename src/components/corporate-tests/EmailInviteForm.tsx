/**
 * Email Invite Form
 * PRD-052: Convite por email — Supabase-backed
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSendTestInvitations } from '@/hooks/useCompanyTestsQuery';
import { useCompanyCreditBalance } from '@/hooks/useTestPackagesQuery';
import { useAuth } from '@/contexts/AuthContext';
import { InsufficientCreditsModal } from '@/components/billing/InsufficientCreditsModal';

interface EmailInviteFormProps {
  testId: string;
  testName: string;
}

export function EmailInviteForm({ testId, testName }: EmailInviteFormProps) {
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [insufficientCreditsOpen, setInsufficientCreditsOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const sendInvitations = useSendTestInvitations();
  const { data: companyCredits } = useCompanyCreditBalance(currentCompany?.id);

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

  const handleSend = async () => {
    if (emails.length === 0) {
      toast({ title: 'Adicione pelo menos um email', variant: 'destructive' });
      return;
    }

    // PRD-089: Check credits before sending
    const balance = companyCredits ?? 0;
    if (balance < emails.length) {
      setCreditBalance(balance);
      setInsufficientCreditsOpen(true);
      return;
    }

    await sendInvitations.mutateAsync({
      testId,
      invitations: emails.map(email => ({
        candidateName: email.split('@')[0],
        candidateEmail: email,
        method: 'email' as const,
      })),
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
            disabled={sendInvitations.isPending}
          />
          <Button variant="outline" onClick={addEmail} disabled={sendInvitations.isPending}>
            Adicionar
          </Button>
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
                disabled={sendInvitations.isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Button onClick={handleSend} disabled={emails.length === 0 || sendInvitations.isPending}>
        {sendInvitations.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Enviar {emails.length > 0 ? `${emails.length} convite${emails.length > 1 ? 's' : ''}` : 'convites'}
      </Button>
      <InsufficientCreditsModal
        open={insufficientCreditsOpen}
        onOpenChange={setInsufficientCreditsOpen}
        balance={creditBalance}
      />
    </div>
  );
}

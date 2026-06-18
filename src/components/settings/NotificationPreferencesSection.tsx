/**
 * NotificationPreferencesSection (Fase 3)
 * Persisted per-collaborator channel opt-in (email/WhatsApp), shown in Settings → Conta.
 * Replaces the previous local-state-only toggles. Read-only under impersonation.
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCollaboratorPreferences,
  useSaveCollaboratorPreferences,
} from '@/hooks/useCollaboratorPreferencesQuery';

export default function NotificationPreferencesSection() {
  const { user, currentCompany, isImpersonationActive } = useAuth();
  const companyId = currentCompany?.id;
  const profileId = user?.id;

  const { data, isLoading } = useCollaboratorPreferences(companyId, profileId);
  const saveMutation = useSaveCollaboratorPreferences();

  const [emailOptIn, setEmailOptIn] = useState(true);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);

  // Sync local state when query data arrives.
  useEffect(() => {
    if (data) {
      setEmailOptIn(data.emailOptIn);
      setWhatsappOptIn(data.whatsappOptIn);
    }
  }, [data]);

  const disabled = isImpersonationActive || saveMutation.isPending || !companyId || !profileId;

  async function persist(next: { emailOptIn: boolean; whatsappOptIn: boolean }) {
    if (!companyId || !profileId) return;
    try {
      await saveMutation.mutateAsync({
        companyId,
        profileId,
        emailOptIn: next.emailOptIn,
        whatsappOptIn: next.whatsappOptIn,
      });
      toast.success('Preferências salvas');
    } catch (err) {
      // Revert optimistic toggle on failure.
      setEmailOptIn(data?.emailOptIn ?? true);
      setWhatsappOptIn(data?.whatsappOptIn ?? false);
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar preferências');
    }
  }

  function handleEmailChange(checked: boolean) {
    setEmailOptIn(checked);
    void persist({ emailOptIn: checked, whatsappOptIn });
  }

  function handleWhatsappChange(checked: boolean) {
    setWhatsappOptIn(checked);
    void persist({ emailOptIn, whatsappOptIn: checked });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Escolha por quais canais você aceita ser contatado. Comunicações essenciais da
          conta (convites e segurança) são sempre enviadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando preferências…
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="pref-email" className="text-foreground cursor-pointer">
                  Receber notificações por e-mail
                </Label>
                <p className="text-xs text-muted-foreground">
                  Avisos e novidades enviados para o seu e-mail cadastrado.
                </p>
              </div>
              <Switch
                id="pref-email"
                checked={emailOptIn}
                onCheckedChange={handleEmailChange}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="pref-whatsapp" className="text-foreground cursor-pointer">
                  Receber notificações por WhatsApp
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mensagens no número cadastrado. Requer seu consentimento explícito.
                </p>
              </div>
              <Switch
                id="pref-whatsapp"
                checked={whatsappOptIn}
                onCheckedChange={handleWhatsappChange}
                disabled={disabled}
              />
            </div>

            {isImpersonationActive && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Durante a impersonação, as preferências são somente leitura.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

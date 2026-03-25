/**
 * ResendPanel Component
 * Custom settings panel for Resend (Email) configuration.
 * Renders the 4 config fields + "Testar Conexão" button with inline feedback.
 */

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, XCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';

interface ResendPanelProps {
  values: Record<string, unknown>;
  onValueChange: (fieldKey: string, value: unknown) => void;
  onSave: () => void;
}

type TestResult = {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  testedAt?: string;
};

function getStatusBadge(result: TestResult, isConfigured: boolean) {
  if (result.status === 'success') {
    return (
      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[11px] gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        Conectado
      </Badge>
    );
  }
  if (result.status === 'error') {
    return (
      <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[11px] gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
        Erro
      </Badge>
    );
  }
  if (isConfigured) {
    return (
      <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-600 text-[11px] gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Não testado
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[11px] gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      Não configurado
    </Badge>
  );
}

function formatTestTimestamp(timestamp?: string): string {
  if (!timestamp) return 'Nunca testado';
  try {
    const date = new Date(timestamp);
    return `Último teste: ${date.toLocaleDateString('pt-BR')} as ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'Nunca testado';
  }
}

export default function ResendPanel({ values, onValueChange, onSave }: ResendPanelProps) {
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });

  const enabled = values.resendEnabled as boolean ?? false;
  const apiKey = (values.resendApiKey as string) ?? '';
  const fromEmail = (values.resendFromEmail as string) ?? '';
  const fromName = (values.resendFromName as string) ?? '';

  const isMasked = apiKey.includes('••••');
  const isConfigured = !!apiKey && !!fromEmail;
  const isTestDisabled = !enabled || !isConfigured || testResult.status === 'testing';

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing' });

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { action: 'test_connection' },
      });

      if (error) {
        setTestResult({
          status: 'error',
          message: error.message || 'Falha ao conectar com o Resend',
          testedAt: new Date().toISOString(),
        });
        toast.error('Falha na conexão', {
          description: error.message,
        });
        return;
      }

      if (data?.success) {
        setTestResult({
          status: 'success',
          message: 'API Key válida — Resend conectado',
          testedAt: new Date().toISOString(),
        });
        toast.success('Conexão estabelecida com sucesso', {
          description: 'API Key válida — Resend pronto para envio',
        });
      } else {
        setTestResult({
          status: 'error',
          message: data?.error || 'Falha ao validar API Key do Resend',
          testedAt: new Date().toISOString(),
        });
        toast.error('Falha na validação', {
          description: data?.error || 'API Key inválida ou sem permissão',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setTestResult({
        status: 'error',
        message,
        testedAt: new Date().toISOString(),
      });
      toast.error('Erro ao testar conexão', { description: message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Integrações - Resend (Email)
            </CardTitle>
            <CardDescription>Integração com Resend para envio de emails transacionais</CardDescription>
          </div>
          {getStatusBadge(testResult, isConfigured)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle: Ativar Email */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="resend-enabled" className="font-medium cursor-pointer">
              Ativar Email
            </Label>
            <p className="text-xs text-muted-foreground">
              Habilitar envio de emails transacionais via Resend
            </p>
          </div>
          <Switch
            id="resend-enabled"
            checked={enabled}
            onCheckedChange={(checked) => onValueChange('resendEnabled', checked)}
          />
        </div>

        {/* Chave de API */}
        <div className="space-y-1.5">
          <Label htmlFor="resend-api-key" className="text-xs font-semibold text-muted-foreground">
            Chave de API
          </Label>
          <Input
            id="resend-api-key"
            type="password"
            value={isMasked ? '' : apiKey}
            placeholder={isMasked ? `Chave salva: ${apiKey}` : 'Cole sua API Key do Resend aqui'}
            onChange={(e) => onValueChange('resendApiKey', e.target.value)}
            className="font-mono text-xs"
          />
          {isMasked && (
            <p className="text-[11px] text-muted-foreground">
              Deixe vazio para manter a chave atual
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Encontre sua API Key em resend.com/api-keys
          </p>
        </div>

        {/* Email Remetente */}
        <div className="space-y-1.5">
          <Label htmlFor="resend-from-email" className="text-xs font-semibold text-muted-foreground">
            Email Remetente
          </Label>
          <Input
            id="resend-from-email"
            type="text"
            value={fromEmail}
            placeholder="noreply@suaempresa.com"
            onChange={(e) => onValueChange('resendFromEmail', e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Endereço de email verificado no Resend para envio (ex: noreply@suaempresa.com)
          </p>
        </div>

        {/* Nome do Remetente */}
        <div className="space-y-1.5">
          <Label htmlFor="resend-from-name" className="text-xs font-semibold text-muted-foreground">
            Nome do Remetente
          </Label>
          <Input
            id="resend-from-name"
            type="text"
            value={fromName}
            placeholder="RecrutaRS"
            onChange={(e) => onValueChange('resendFromName', e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Nome exibido como remetente dos emails (ex: RecrutaRS)
          </p>
        </div>

        {/* Test Connection Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTestDisabled}
              className="gap-1.5 text-xs"
              aria-label="Testar conexão com o Resend"
            >
              {testResult.status === 'testing' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {testResult.status === 'testing' ? 'Testando...' : 'Testar Conexão'}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              {formatTestTimestamp(testResult.testedAt)}
            </span>
          </div>

          {/* Inline result */}
          {testResult.status === 'success' && (
            <div
              className="flex items-start gap-2 p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20"
              role="alert"
            >
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Conexão estabelecida com sucesso
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {testResult.status === 'error' && (
            <div
              className="flex items-start gap-2 p-3 rounded-lg border bg-destructive/10 border-destructive/20"
              role="alert"
            >
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Falha na conexão
                </p>
                <p className="text-xs text-destructive/80">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {!enabled && isConfigured && (
            <p className="text-xs text-amber-500">
              Ative o Email para testar a conexão.
            </p>
          )}

          {enabled && !isConfigured && (
            <p className="text-xs text-muted-foreground">
              Preencha a API Key e o Email Remetente e salve antes de testar.
            </p>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

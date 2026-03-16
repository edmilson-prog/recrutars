/**
 * EvolutionPanel Component
 * Custom settings panel for Evolution API (WhatsApp) configuration.
 * Renders the 4 config fields + "Testar Conexão" button with inline feedback.
 */

import { useState } from 'react';
import { Zap, Loader2, CheckCircle, XCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface EvolutionPanelProps {
  values: Record<string, unknown>;
  onValueChange: (fieldKey: string, value: unknown) => void;
  onSave: () => void;
}

type TestResult = {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  state?: string;
  testedAt?: string;
};

function getStatusBadge(result: TestResult, apiUrl: string) {
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
  if (apiUrl) {
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

export default function EvolutionPanel({ values, onValueChange, onSave }: EvolutionPanelProps) {
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });

  const enabled = values.evolutionEnabled as boolean ?? false;
  const apiUrl = (values.evolutionApiUrl as string) ?? '';
  const apiKey = (values.evolutionApiKey as string) ?? '';
  const instanceName = (values.evolutionInstanceName as string) ?? '';

  const isMasked = apiKey.includes('••••');
  const isConfigured = !!apiUrl && !!apiKey && !!instanceName;
  const isTestDisabled = !enabled || !isConfigured || testResult.status === 'testing';

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing' });

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { action: 'get_connection_status' },
      });

      if (error) {
        setTestResult({
          status: 'error',
          message: error.message || 'Falha ao conectar com a Evolution API',
          testedAt: new Date().toISOString(),
        });
        toast.error('Falha na conexão', {
          description: error.message,
        });
        return;
      }

      if (data?.connected) {
        setTestResult({
          status: 'success',
          message: `Instância "${instanceName}" conectada`,
          state: data.state || 'open',
          testedAt: new Date().toISOString(),
        });
        toast.success('Conexão estabelecida com sucesso', {
          description: `Instância "${instanceName}" - Status: ${data.state || 'open'}`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: data?.state === 'close'
            ? 'Instância desconectada. Escaneie o QR Code na Evolution API.'
            : `Instância com status: ${data?.state || 'desconhecido'}`,
          state: data?.state,
          testedAt: new Date().toISOString(),
        });
        toast.error('Instância não conectada', {
          description: `Status: ${data?.state || 'desconhecido'}`,
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
              Integrações - Evolution API (WhatsApp)
            </CardTitle>
            <CardDescription>Integração com WhatsApp via Evolution API</CardDescription>
          </div>
          {getStatusBadge(testResult, apiUrl)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle: Ativar WhatsApp */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="evolution-enabled" className="font-medium cursor-pointer">
              Ativar WhatsApp
            </Label>
            <p className="text-xs text-muted-foreground">
              Habilitar envio de mensagens via WhatsApp pela Evolution API
            </p>
          </div>
          <Switch
            id="evolution-enabled"
            checked={enabled}
            onCheckedChange={(checked) => onValueChange('evolutionEnabled', checked)}
          />
        </div>

        {/* URL da API */}
        <div className="space-y-1.5">
          <Label htmlFor="evolution-api-url" className="text-xs font-semibold text-muted-foreground">
            URL da API
          </Label>
          <Input
            id="evolution-api-url"
            type="text"
            value={apiUrl}
            placeholder="https://api.seudominio.com"
            onChange={(e) => onValueChange('evolutionApiUrl', e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            URL base da instância Evolution API (ex: https://api.seudominio.com)
          </p>
        </div>

        {/* Chave de API */}
        <div className="space-y-1.5">
          <Label htmlFor="evolution-api-key" className="text-xs font-semibold text-muted-foreground">
            Chave de API
          </Label>
          <Input
            id="evolution-api-key"
            type="password"
            value={isMasked ? '' : apiKey}
            placeholder={isMasked ? `Chave salva: ${apiKey}` : 'Cole sua chave de API aqui'}
            onChange={(e) => onValueChange('evolutionApiKey', e.target.value)}
            className="font-mono text-xs"
          />
          {isMasked && (
            <p className="text-[11px] text-muted-foreground">
              Deixe vazio para manter a chave atual
            </p>
          )}
        </div>

        {/* Nome da Instância */}
        <div className="space-y-1.5">
          <Label htmlFor="evolution-instance" className="text-xs font-semibold text-muted-foreground">
            Nome da Instância
          </Label>
          <Input
            id="evolution-instance"
            type="text"
            value={instanceName}
            placeholder="Nome da instância na Evolution API"
            onChange={(e) => onValueChange('evolutionInstanceName', e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Nome da instância configurada na Evolution API
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
              aria-label="Testar conexão com a Evolution API"
            >
              {testResult.status === 'testing' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
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
                  {testResult.message} — Status: {testResult.state}
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
              Ative o WhatsApp para testar a conexão.
            </p>
          )}

          {enabled && !isConfigured && (
            <p className="text-xs text-muted-foreground">
              Preencha todos os campos e salve antes de testar.
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

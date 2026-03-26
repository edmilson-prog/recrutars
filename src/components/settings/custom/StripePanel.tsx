/**
 * StripePanel Component
 * Custom settings panel for Stripe payment gateway configuration.
 * Groups keys by environment (Test/Live) with tabs, partial key display, and test connection.
 */

import { useState, useCallback } from 'react';
import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  Pencil,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStripeService } from '@/services/stripe/stripeService';
import type { StripeEnvironment } from '@/types/plans';

interface StripePanelProps {
  values: Record<string, unknown>;
  onValueChange: (fieldKey: string, value: unknown) => void;
  onSave: () => void;
}

type TestResult = {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  testedAt?: string;
};

interface KeyFieldConfig {
  fieldKey: string;
  label: string;
  description: string;
  prefix: string;
}

const TEST_KEYS: KeyFieldConfig[] = [
  {
    fieldKey: 'stripeTestPublishableKey',
    label: 'Chave Publicável',
    description: 'Publishable key do ambiente de teste (pk_test_...)',
    prefix: 'pk_test_',
  },
  {
    fieldKey: 'stripeTestSecretKey',
    label: 'Chave Secreta',
    description: 'Secret key do ambiente de teste. Usada apenas nas Edge Functions.',
    prefix: 'sk_test_',
  },
  {
    fieldKey: 'stripeTestWebhookSecret',
    label: 'Webhook Secret',
    description: 'Signing secret do webhook de teste (whsec_...)',
    prefix: 'whsec_',
  },
];

const LIVE_KEYS: KeyFieldConfig[] = [
  {
    fieldKey: 'stripeLivePublishableKey',
    label: 'Chave Publicável',
    description: 'Publishable key do ambiente de produção (pk_live_...)',
    prefix: 'pk_live_',
  },
  {
    fieldKey: 'stripeLiveSecretKey',
    label: 'Chave Secreta',
    description: 'Secret key do ambiente de produção. Usada apenas nas Edge Functions.',
    prefix: 'sk_live_',
  },
  {
    fieldKey: 'stripeLiveWebhookSecret',
    label: 'Webhook Secret',
    description: 'Signing secret do webhook de produção (whsec_...)',
    prefix: 'whsec_',
  },
];

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
    return `Último teste: ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'Nunca testado';
  }
}

function isMaskedValue(value: string): boolean {
  return value.includes('••••');
}

// ── StripeKeyField sub-component ──

interface StripeKeyFieldProps {
  config: KeyFieldConfig;
  value: string;
  isEditing: boolean;
  isTesting: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onConfirmEdit: (newValue: string) => void;
  onChange: (value: string) => void;
}

function StripeKeyField({
  config,
  value,
  isEditing,
  isTesting,
  onStartEdit,
  onCancelEdit,
  onConfirmEdit,
  onChange,
}: StripeKeyFieldProps) {
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = () => {
    setEditValue('');
    onStartEdit();
  };

  const handleConfirm = () => {
    onConfirmEdit(editValue);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditValue('');
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isEmpty = !value || value === '';
  const masked = !isEmpty && isMaskedValue(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground">
          {config.label}
        </Label>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            disabled={isTesting}
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            aria-label={`Editar ${config.label}`}
          >
            <Pencil className="h-3 w-3" />
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              type="text"
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                onChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={masked ? `Chave salva: ${value}` : `Cole sua ${config.prefix}... aqui`}
              className="font-mono text-xs flex-1"
              autoFocus
              aria-label={config.label}
              aria-describedby={`${config.fieldKey}-helper`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleConfirm}
              className="h-9 w-9 shrink-0 text-primary hover:text-primary"
              aria-label="Confirmar"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="Cancelar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p id={`${config.fieldKey}-helper`} className="text-[11px] text-muted-foreground">
            {masked
              ? 'Cole a nova chave completa. Deixe vazio para manter a atual.'
              : 'Cole a chave completa fornecida pelo Stripe.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-muted/50 p-3 flex items-center justify-between gap-2">
          {isEmpty ? (
            <span className="text-xs text-muted-foreground italic">
              Não configurado
            </span>
          ) : (
            <span className="font-mono text-xs tracking-wider text-foreground select-all">
              {value}
            </span>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {config.description}
      </p>
    </div>
  );
}

// ── Main StripePanel component ──

export default function StripePanel({ values, onValueChange, onSave }: StripePanelProps) {
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });
  // Track which field is currently being edited: fieldKey -> original masked value
  const [editingField, setEditingField] = useState<string | null>(null);
  const [originalValue, setOriginalValue] = useState<string>('');

  const activeEnv = (values.stripeActiveEnvironment as string) ?? 'test';
  const isLive = activeEnv === 'live';

  // Check if the active environment has a secret key configured
  const activeSecretKey = isLive
    ? ((values.stripeLiveSecretKey as string) ?? '')
    : ((values.stripeTestSecretKey as string) ?? '');
  const isConfigured = !!activeSecretKey && activeSecretKey !== '';
  const isTestDisabled = !isConfigured || testResult.status === 'testing';

  const startEditing = useCallback((fieldKey: string) => {
    const current = (values[fieldKey] as string) ?? '';
    setEditingField(fieldKey);
    setOriginalValue(current);
  }, [values]);

  const cancelEditing = useCallback(() => {
    if (editingField) {
      // Restore original value
      onValueChange(editingField, originalValue);
    }
    setEditingField(null);
    setOriginalValue('');
  }, [editingField, originalValue, onValueChange]);

  const confirmEditing = useCallback((fieldKey: string, newValue: string) => {
    if (!newValue || newValue.trim() === '') {
      // Empty = keep original
      onValueChange(fieldKey, originalValue);
    } else {
      onValueChange(fieldKey, newValue);
    }
    setEditingField(null);
    setOriginalValue('');
  }, [originalValue, onValueChange]);

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing' });
    try {
      const service = await getStripeService();
      const result = await service.testConnection(activeEnv as StripeEnvironment);

      if (result.success) {
        setTestResult({
          status: 'success',
          message: `Conexão Stripe (${isLive ? 'produção' : 'teste'}) estabelecida com sucesso`,
          testedAt: new Date().toISOString(),
        });
        toast.success('Conexão Stripe estabelecida', {
          description: `Ambiente ${isLive ? 'de produção' : 'de teste'} conectado`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: result.error || 'Falha ao validar chave Stripe',
          testedAt: new Date().toISOString(),
        });
        toast.error('Falha na conexão Stripe', {
          description: result.error,
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

  const renderKeyFields = (keys: KeyFieldConfig[]) =>
    keys.map((config) => {
      const value = (values[config.fieldKey] as string) ?? '';
      return (
        <StripeKeyField
          key={config.fieldKey}
          config={config}
          value={value}
          isEditing={editingField === config.fieldKey}
          isTesting={testResult.status === 'testing'}
          onStartEdit={() => {
            // Cancel any current editing first
            if (editingField) cancelEditing();
            startEditing(config.fieldKey);
          }}
          onCancelEdit={cancelEditing}
          onConfirmEdit={(newValue) => confirmEditing(config.fieldKey, newValue)}
          onChange={(v) => onValueChange(config.fieldKey, v)}
        />
      );
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Integrações - Stripe
            </CardTitle>
            <CardDescription>Gateway de pagamento para assinaturas e pacotes</CardDescription>
          </div>
          {getStatusBadge(testResult, isConfigured)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Environment Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">
            Ambiente Ativo
          </Label>
          <Select
            value={activeEnv}
            onValueChange={(env) => onValueChange('stripeActiveEnvironment', env)}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Teste (sandbox)</SelectItem>
              <SelectItem value="live">Produção (real)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Selecione qual ambiente o sistema utilizará para processar pagamentos.
          </p>
        </div>

        {/* Contextual Environment Banner */}
        {isLive ? (
          <div className="flex items-start gap-2 p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Ambiente de produção ativo — cobranças reais estão habilitadas.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Ambiente de teste ativo — nenhuma cobrança real será efetuada.
            </p>
          </div>
        )}

        {/* Tabs Test / Live */}
        <Tabs defaultValue={activeEnv} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="test" className="flex-1 gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${!isLive ? 'bg-yellow-500' : 'bg-muted-foreground/40'}`} />
              Teste
            </TabsTrigger>
            <TabsTrigger value="live" className="flex-1 gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
              Produção
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-5 mt-4">
            {isLive && (
              <p className="text-[11px] text-muted-foreground italic">
                Este ambiente não está ativo no momento.
              </p>
            )}
            {renderKeyFields(TEST_KEYS)}
          </TabsContent>

          <TabsContent value="live" className="space-y-5 mt-4">
            {!isLive && (
              <p className="text-[11px] text-muted-foreground italic">
                Este ambiente não está ativo no momento.
              </p>
            )}
            {renderKeyFields(LIVE_KEYS)}
          </TabsContent>
        </Tabs>

        {/* Test Connection Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTestDisabled}
              className="gap-1.5 text-xs"
              aria-label="Testar conexão com o Stripe"
              aria-busy={testResult.status === 'testing'}
            >
              {testResult.status === 'testing' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
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

          {!isConfigured && (
            <p className="text-xs text-muted-foreground">
              Configure as chaves do ambiente ativo e salve antes de testar a conexão.
            </p>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onSave} className="gap-2 w-full sm:w-auto">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

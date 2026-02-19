/**
 * LLMProvidersPanel Component (PRD-080)
 * Painel principal de configuração de provedores LLM
 * Renderizado como custom component dentro do ConfigContent
 */

import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLLMConnectionTest } from '@/hooks/useLLMConnectionTest';
import { useLLMModels } from '@/hooks/useLLMModels';
import { ConsumptionPanel } from './ConsumptionPanel';
import { ProviderCard } from './ProviderCard';
import type { LLMProvider } from '@/types/aiAnalysis';

interface LLMProvidersPanelProps {
  values: Record<string, unknown>;
  onValueChange: (fieldKey: string, value: unknown) => void;
  onSave: () => void;
}

function LLMProvidersPanel({ values, onValueChange, onSave }: LLMProvidersPanelProps) {
  const { toast } = useToast();
  const testMutation = useLLMConnectionTest();

  // Read values with defaults
  const agentEnabled = (values.agentEnabled as boolean) ?? true;
  const defaultProvider = (values.defaultProvider as LLMProvider) ?? 'anthropic';

  const anthropicApiKey = (values.anthropicApiKey as string) ?? '';
  const anthropicModel = (values.anthropicModel as string) ?? 'claude-sonnet-4-20250514';
  const anthropicTemperature = (values.anthropicTemperature as number) ?? 0.7;
  const anthropicMaxTokens = (values.anthropicMaxTokens as number) ?? 2000;
  const anthropicLastTestAt = (values.anthropicLastTestAt as string) ?? '';
  const anthropicLastTestStatus = (values.anthropicLastTestStatus as string) ?? '';

  const openaiApiKey = (values.openaiApiKey as string) ?? '';
  const openaiModel = (values.openaiModel as string) ?? 'gpt-4o';
  const openaiTemperature = (values.openaiTemperature as number) ?? 0.7;
  const openaiMaxTokens = (values.openaiMaxTokens as number) ?? 2000;
  const openaiLastTestAt = (values.openaiLastTestAt as string) ?? '';
  const openaiLastTestStatus = (values.openaiLastTestStatus as string) ?? '';

  // Model queries
  const anthropicModels = useLLMModels('anthropic', anthropicApiKey);
  const openaiModels = useLLMModels('openai', openaiApiKey);

  const handleTestConnection = async (provider: LLMProvider) => {
    const apiKey = provider === 'anthropic' ? anthropicApiKey : openaiApiKey;
    const model = provider === 'anthropic' ? anthropicModel : openaiModel;
    const prefix = provider === 'anthropic' ? 'anthropic' : 'openai';

    if (!apiKey || apiKey.includes('••••')) {
      toast({
        title: 'Chave necessária',
        description: 'Insira a chave de API antes de testar a conexão.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await testMutation.mutateAsync({ provider, apiKey, model });
      const now = new Date().toISOString();
      onValueChange(`${prefix}LastTestAt`, now);

      if (result.success) {
        onValueChange(`${prefix}LastTestStatus`, 'success');
        toast({
          title: 'Conexão bem-sucedida',
          description: `${provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} conectado em ${result.latencyMs}ms.`,
        });
      } else {
        onValueChange(`${prefix}LastTestStatus`, 'error');
        toast({
          title: 'Falha na conexão',
          description: result.error || 'Não foi possível conectar ao provedor.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      onValueChange(`${prefix}LastTestStatus`, 'error');
      onValueChange(`${prefix}LastTestAt`, new Date().toISOString());
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao testar conexão.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">Provedores LLM</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as chaves de API e configurações dos modelos de linguagem
          </p>
        </div>
        <Button onClick={onSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>

      {/* Toggle Global */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Ativar Agente IA</Label>
            <p className="text-xs text-muted-foreground">
              Habilita análise inteligente dos resultados Gauge-Pro em toda a plataforma
            </p>
          </div>
          <Switch
            checked={agentEnabled}
            onCheckedChange={(checked) => onValueChange('agentEnabled', checked)}
          />
        </CardContent>
      </Card>

      {/* Consumo */}
      <div className="space-y-2">
        <SectionTitle>Consumo</SectionTitle>
        <ConsumptionPanel activeProvider={defaultProvider} />
      </div>

      {/* Provedor Padrão */}
      <div className="space-y-2">
        <SectionTitle>Provedor Padrão</SectionTitle>
        <Card>
          <CardContent className="flex items-center justify-between py-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Provedor de LLM utilizado nas funcionalidades de IA</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Todas as chamadas de IA usarão o provedor selecionado. Ambos podem ser configurados simultaneamente.
              </p>
            </div>
            <div className="min-w-[200px]">
              <Select
                value={defaultProvider}
                onValueChange={(val) => onValueChange('defaultProvider', val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic" className="text-xs">Anthropic (Claude)</SelectItem>
                  <SelectItem value="openai" className="text-xs">OpenAI (GPT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provedores Configurados */}
      <div className="space-y-2">
        <SectionTitle>Provedores Configurados</SectionTitle>

        <ProviderCard
          provider="anthropic"
          providerName="Anthropic"
          providerIcon="🔷"
          subtitle="Família Claude · claude-sonnet-4, claude-haiku-4.5..."
          apiKey={anthropicApiKey}
          model={anthropicModel}
          temperature={anthropicTemperature}
          maxTokens={anthropicMaxTokens}
          lastTestAt={anthropicLastTestAt}
          lastTestStatus={anthropicLastTestStatus}
          isAgentActive={agentEnabled}
          models={anthropicModels.data ?? []}
          isLoadingModels={anthropicModels.isLoading}
          tempRange={{ min: 0, max: 1, step: 0.1 }}
          maxTokensRange={{ min: 500, max: 4096 }}
          onApiKeyChange={(val) => onValueChange('anthropicApiKey', val)}
          onModelChange={(val) => onValueChange('anthropicModel', val)}
          onTemperatureChange={(val) => onValueChange('anthropicTemperature', val)}
          onMaxTokensChange={(val) => onValueChange('anthropicMaxTokens', val)}
          onTestConnection={() => handleTestConnection('anthropic')}
          onRefreshModels={() => anthropicModels.refresh()}
          isTestingConnection={testMutation.isPending}
        />

        <ProviderCard
          provider="openai"
          providerName="OpenAI"
          providerIcon="🟢"
          subtitle="Família GPT · gpt-4o, gpt-4o-mini, gpt-5..."
          apiKey={openaiApiKey}
          model={openaiModel}
          temperature={openaiTemperature}
          maxTokens={openaiMaxTokens}
          lastTestAt={openaiLastTestAt}
          lastTestStatus={openaiLastTestStatus}
          isAgentActive={agentEnabled}
          models={openaiModels.data ?? []}
          isLoadingModels={openaiModels.isLoading}
          tempRange={{ min: 0, max: 2, step: 0.1 }}
          maxTokensRange={{ min: 500, max: 16384 }}
          onApiKeyChange={(val) => onValueChange('openaiApiKey', val)}
          onModelChange={(val) => onValueChange('openaiModel', val)}
          onTemperatureChange={(val) => onValueChange('openaiTemperature', val)}
          onMaxTokensChange={(val) => onValueChange('openaiMaxTokens', val)}
          onTestConnection={() => handleTestConnection('openai')}
          onRefreshModels={() => openaiModels.refresh()}
          isTestingConnection={testMutation.isPending}
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
      {children}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default LLMProvidersPanel;

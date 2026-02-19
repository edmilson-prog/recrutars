/**
 * ProviderCard Component (PRD-080)
 * Card individual para configuração de provedor LLM
 */

import { useState } from 'react';
import { ChevronDown, Zap, RefreshCw, Settings2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { LLMProvider, LLMModelInfo } from '@/types/aiAnalysis';

interface ProviderCardProps {
  provider: LLMProvider;
  providerName: string;
  providerIcon: string;
  subtitle: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  lastTestAt: string;
  lastTestStatus: string;
  isAgentActive: boolean;
  models: LLMModelInfo[];
  isLoadingModels: boolean;
  tempRange: { min: number; max: number; step: number };
  maxTokensRange: { min: number; max: number };
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onTestConnection: () => void;
  onRefreshModels: () => void;
  isTestingConnection: boolean;
}

function getStatusBadge(lastTestStatus: string, apiKey: string) {
  if (lastTestStatus === 'success') {
    return (
      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[11px] gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        Configurado
      </Badge>
    );
  }
  if (lastTestStatus === 'error') {
    return (
      <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[11px] gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
        Erro
      </Badge>
    );
  }
  if (apiKey && !apiKey.includes('••••') && apiKey.length > 0) {
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

function formatTestTimestamp(lastTestAt: string): string {
  if (!lastTestAt) return 'Nunca testado';
  try {
    const date = new Date(lastTestAt);
    return `Último teste: ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'Nunca testado';
  }
}

export function ProviderCard({
  provider,
  providerName,
  providerIcon,
  subtitle,
  apiKey,
  model,
  temperature,
  maxTokens,
  lastTestAt,
  lastTestStatus,
  isAgentActive,
  models,
  isLoadingModels,
  tempRange,
  maxTokensRange,
  onApiKeyChange,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
  onTestConnection,
  onRefreshModels,
  isTestingConnection,
}: ProviderCardProps) {
  const [paramsOpen, setParamsOpen] = useState(false);
  const isMasked = apiKey.includes('••••');
  const accentColor = provider === 'anthropic' ? 'text-primary' : provider === 'openrouter' ? 'text-orange-500' : 'text-blue-500';

  return (
    <Card className={cn('relative transition-opacity', !isAgentActive && 'opacity-50')}>
      {!isAgentActive && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="text-[10px]">Inativo</Badge>
        </div>
      )}

      {/* Header */}
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-muted border">
              {providerIcon}
            </div>
            <div>
              <div className="text-sm font-semibold">{providerName}</div>
              <div className="text-xs text-muted-foreground">{subtitle}</div>
            </div>
          </div>
          {getStatusBadge(lastTestStatus, apiKey)}
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="space-y-4 pt-4">
        {/* API Key */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Chave de API</Label>
          <Input
            type="password"
            value={isMasked ? '' : apiKey}
            placeholder={isMasked ? `Chave salva: ${apiKey}` : 'Cole sua chave de API aqui'}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="font-mono text-xs"
          />
          {isMasked && (
            <p className="text-[11px] text-muted-foreground">
              Deixe vazio para manter a chave atual
            </p>
          )}
        </div>

        {/* Model Selection */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Modelo Padrão</Label>
            <Select value={model} onValueChange={onModelChange}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {models.length > 0 ? (
                  models.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={model} className="text-xs">
                    {model}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {models.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {models.length} modelos disponíveis
              </p>
            )}
          </div>
          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshModels}
              disabled={isLoadingModels || !apiKey || isMasked}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoadingModels && 'animate-spin')} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Collapsible Params */}
      <Collapsible open={paramsOpen} onOpenChange={setParamsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full px-6 py-3 border-t text-left hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Settings2 className="h-3.5 w-3.5" />
              Parâmetros de Geração
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', paramsOpen && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-6 pb-4 pt-2 border-t space-y-4">
            {/* Temperature */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Temperatura</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[temperature]}
                  min={tempRange.min}
                  max={tempRange.max}
                  step={tempRange.step}
                  onValueChange={([val]) => onTemperatureChange(val)}
                  className={cn('flex-1', provider === 'anthropic' ? '[&_[role=slider]]:bg-primary' : provider === 'openrouter' ? '[&_[role=slider]]:bg-orange-500' : '[&_[role=slider]]:bg-blue-500')}
                />
                <div className="w-14 text-center py-1 px-2 bg-muted rounded-md font-mono text-xs">
                  {temperature.toFixed(1)}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Criatividade ({tempRange.min.toFixed(1)} = determinística, {tempRange.max.toFixed(1)} = criativa)
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Max Tokens por Análise</Label>
              <Input
                type="number"
                value={maxTokens}
                min={maxTokensRange.min}
                max={maxTokensRange.max}
                onChange={(e) => onMaxTokensChange(Number(e.target.value))}
                className="font-mono text-xs w-32"
              />
              <p className="text-[11px] text-muted-foreground">
                Limite de tokens por análise gerada ({maxTokensRange.min}–{maxTokensRange.max})
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Test Connection Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onTestConnection}
          disabled={isTestingConnection || !apiKey || isMasked}
          className="gap-1.5 text-xs"
        >
          {isTestingConnection ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
          Testar Conexão
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {formatTestTimestamp(lastTestAt)}
        </span>
      </div>
    </Card>
  );
}

/**
 * ConsumptionPanel Component (PRD-080)
 * Painel de consumo mensal de provedores LLM (dados mockados)
 */

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MOCK_CONSUMPTION } from '@/data/llmConsumptionMock';
import type { LLMProvider } from '@/types/aiAnalysis';

interface ConsumptionPanelProps {
  activeProvider: LLMProvider;
}

export function ConsumptionPanel({ activeProvider }: ConsumptionPanelProps) {
  const [view, setView] = useState<'consolidated' | 'breakdown'>('consolidated');
  const { toast } = useToast();
  const data = MOCK_CONSUMPTION;
  const progressPercent = Math.round((data.totalCalls / data.callLimit) * 100);

  const handleRefresh = () => {
    toast({ title: 'Dados atualizados', description: 'Métricas de consumo atualizadas.' });
  };

  const providerLabel = activeProvider === 'anthropic' ? 'Anthropic' : 'OpenAI';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Consumo Mensal</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {data.month} · Provedor ativo: <span className="font-semibold text-primary">{providerLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-muted/30 p-0.5 gap-0.5">
              <button
                onClick={() => setView('consolidated')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  view === 'consolidated'
                    ? 'bg-background border shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Consolidado
              </button>
              <button
                onClick={() => setView('breakdown')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  view === 'breakdown'
                    ? 'bg-background border shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Por Provedor
              </button>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 pt-0">
        {view === 'consolidated' ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-3 divide-x border-t border-b">
              {[
                { value: data.totalCalls.toString(), unit: 'chamadas', label: 'Total de requisições' },
                { value: data.totalTokens.toLocaleString('pt-BR'), unit: 'tokens', label: 'Tokens consumidos' },
                { value: `R$ ${data.estimatedCost.toFixed(2)}`, unit: '', label: 'Custo estimado' },
              ].map((kpi) => (
                <div key={kpi.label} className="px-4 py-3">
                  <div className="text-2xl font-bold">
                    {kpi.value}{' '}
                    {kpi.unit && <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-3 border-b">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>{data.totalCalls} de {data.callLimit} chamadas</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>

            {/* Weekly History */}
            <div className="px-4 py-3">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Histórico Semanal
              </div>
              {data.weekly.map((week) => (
                <div
                  key={week.period}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 text-xs"
                >
                  <span className="text-muted-foreground">{week.period}</span>
                  <span className={`font-semibold ${week.calls === 0 ? 'text-muted-foreground' : ''}`}>
                    {week.calls} chamadas
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {week.tokens === 0 ? '—' : `${week.tokens.toLocaleString('pt-BR')} tokens`}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px] min-w-[60px] text-right">
                    R$ {week.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Per-Provider */}
            <div className="grid grid-cols-2 divide-x border-t border-b">
              {(['anthropic', 'openai'] as const).map((provider) => {
                const p = data.byProvider[provider];
                const color = provider === 'anthropic' ? 'text-primary' : 'text-blue-500';
                const bgColor = provider === 'anthropic' ? 'bg-primary' : 'bg-blue-500';
                return (
                  <div key={provider} className="px-4 py-3">
                    <div className={`flex items-center gap-2 text-xs font-bold mb-3 ${color}`}>
                      <div className={`w-2 h-2 rounded-full ${bgColor}`} />
                      {provider === 'anthropic' ? 'Anthropic' : 'OpenAI'}
                    </div>
                    {[
                      ['Chamadas', p.calls.toString()],
                      ['Tokens', p.tokens.toLocaleString('pt-BR')],
                      ['Custo est.', `R$ ${p.cost.toFixed(2)}`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-xs py-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono text-[11px]">{val}</span>
                      </div>
                    ))}
                    <div className="h-1 bg-muted rounded-full mt-2.5">
                      <div
                        className={`h-full rounded-full ${bgColor}`}
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekly History by Provider */}
            <div className="px-4 py-3">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Histórico Semanal · Por Provedor
              </div>
              {data.weekly.map((week) => (
                <div
                  key={week.period}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 text-xs"
                >
                  <span className="text-muted-foreground min-w-[130px]">{week.period}</span>
                  <div className="flex gap-4 text-[11px]">
                    <span className="text-primary">Anthropic: {week.byProvider?.anthropic ?? 0} calls</span>
                    <span className="text-blue-500">OpenAI: {week.byProvider?.openai ?? 0} calls</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    R$ {week.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * SimulatorPanel Component
 * PRD-062: Feature Flags "Switch"
 *
 * Form panel for simulation context (single and comparison modes).
 */

import { useState } from 'react';
import { Play, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import type { EvaluationContext } from '@/types';

interface SimulatorPanelProps {
  onSimulate: (context: EvaluationContext) => void;
  onCompare: (a: EvaluationContext, b: EvaluationContext) => void;
  mode: 'single' | 'comparison';
}

const userTypes = [
  { value: 'admin', label: 'Admin' },
  { value: 'company', label: 'Empresa' },
  { value: 'candidate', label: 'Candidato' },
];

const plansByType: Record<string, { value: string; label: string }[]> = {
  candidate: [
    { value: 'essencial', label: 'Essencial' },
    { value: 'avancar', label: 'Avançar' },
    { value: 'destaque-maximo', label: 'Destaque Máximo' },
  ],
  company: [
    { value: 'essencial-empresas', label: 'Essencial Empresas' },
    { value: 'selecao-inteligente', label: 'Seleção Inteligente' },
    { value: 'recrutamento-premium', label: 'Recrutamento Premium' },
  ],
  admin: [
    { value: 'admin', label: 'Admin' },
  ],
};

const roleOptions = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

function defaultContext(): EvaluationContext {
  return {
    userId: 'sim-user-1',
    userType: 'candidate',
    planSlug: 'essencial',
    roleSlug: 'viewer',
    capabilities: [],
  };
}

function ContextForm({
  context,
  onChange,
  label,
}: {
  context: EvaluationContext;
  onChange: (ctx: EvaluationContext) => void;
  label?: string;
}) {
  const plans = plansByType[context.userType] || [];

  return (
    <div className="space-y-4">
      {label && (
        <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo de usuário</Label>
          <Select
            value={context.userType}
            onValueChange={(v) => {
              const ut = v as 'admin' | 'company' | 'candidate';
              const defaultPlan = plansByType[ut]?.[0]?.value || '';
              onChange({ ...context, userType: ut, planSlug: defaultPlan });
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {userTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Plano</Label>
          <Select
            value={context.planSlug}
            onValueChange={(v) => onChange({ ...context, planSlug: v })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Papel</Label>
          <Select
            value={context.roleSlug || 'viewer'}
            onValueChange={(v) => onChange({ ...context, roleSlug: v })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function SimulatorPanel({ onSimulate, onCompare, mode: initialMode }: SimulatorPanelProps) {
  const [mode, setMode] = useState<'single' | 'comparison'>(initialMode);
  const [contextA, setContextA] = useState<EvaluationContext>(defaultContext());
  const [contextB, setContextB] = useState<EvaluationContext>({
    ...defaultContext(),
    userId: 'sim-user-2',
    planSlug: 'avancar',
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Configurar Simulação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'comparison')}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="single">Individual</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <ContextForm context={contextA} onChange={setContextA} />
            <Button
              onClick={() => onSimulate(contextA)}
              className="mt-4 bg-cyan-600 hover:bg-cyan-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Simular
            </Button>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border bg-muted/30">
                <ContextForm context={contextA} onChange={setContextA} label="Contexto A" />
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <ContextForm context={contextB} onChange={setContextB} label="Contexto B" />
              </div>
            </div>
            <Button
              onClick={() => onCompare(contextA, contextB)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Comparar
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

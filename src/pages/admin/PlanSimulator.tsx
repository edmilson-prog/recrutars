/**
 * PlanSimulator Page
 * PRD-062: Feature Flags "Switch" - Plan Simulation
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wand2, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SimulatorBanner } from '@/components/admin/flags/SimulatorBanner';
import { SimulatorPanel } from '@/components/admin/flags/SimulatorPanel';
import { EvaluationChain } from '@/components/admin/flags/EvaluationChain';
import { useSimulation } from '@/contexts/SimulationContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import type { EvaluationContext, EvaluationResult } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const categoryLabels: Record<string, string> = {
  candidate: 'Candidato',
  company: 'Empresa',
  beta: 'Beta',
  platform: 'Plataforma',
};

export default function PlanSimulator() {
  const {
    isSimulating,
    simulatedContext,
    comparisonContext,
    results,
    comparisonResults,
    startSimulation,
    startComparison,
    stopSimulation,
    flags,
  } = useSimulation();

  const { evaluateDetailed } = useFeatureFlags();

  // Group flags by category
  const groupedFlags = useMemo(() => {
    const groups: Record<string, typeof flags> = {};
    flags.forEach((flag) => {
      if (!groups[flag.category]) groups[flag.category] = [];
      groups[flag.category].push(flag);
    });
    return groups;
  }, [flags]);

  const handleSimulate = (context: EvaluationContext) => {
    startSimulation(context);
  };

  const handleCompare = (a: EvaluationContext, b: EvaluationContext) => {
    startComparison(a, b);
  };

  const isComparisonMode = !!comparisonContext;

  return (
    <DashboardLayout userType="admin">
      {/* Simulation banner */}
      <SimulatorBanner isSimulating={isSimulating} onStop={stopSimulation} />

      <div className={cn('space-y-6', isSimulating && 'pt-10')}>
        <PageHeader
          title="Simulador de Planos"
          description="Simule como as feature flags se comportam para diferentes contextos de usuário, plano e papel."
          howItWorks={[
            'Simule cenarios de planos e precos',
            'Visualize o impacto de mudancas antes de aplicar',
            'Compare diferentes configuracoes lado a lado',
          ]}
        />

        <AdminTabNav />

        {/* Simulator Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SimulatorPanel
            onSimulate={handleSimulate}
            onCompare={handleCompare}
            mode="single"
          />
        </motion.div>

        {/* Results */}
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Context summary */}
            <div className={cn(
              'grid gap-4',
              isComparisonMode ? 'md:grid-cols-2' : 'grid-cols-1'
            )}>
              <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4 pb-3">
                  <h3 className="text-sm font-semibold mb-2">
                    {isComparisonMode ? 'Contexto A' : 'Contexto Simulado'}
                  </h3>
                  {simulatedContext && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">Tipo: {simulatedContext.userType}</Badge>
                      <Badge variant="outline">Plano: {simulatedContext.planSlug}</Badge>
                      {simulatedContext.roleSlug && (
                        <Badge variant="outline">Papel: {simulatedContext.roleSlug}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              {isComparisonMode && comparisonContext && (
                <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-4 pb-3">
                    <h3 className="text-sm font-semibold mb-2">Contexto B</h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">Tipo: {comparisonContext.userType}</Badge>
                      <Badge variant="outline">Plano: {comparisonContext.planSlug}</Badge>
                      {comparisonContext.roleSlug && (
                        <Badge variant="outline">Papel: {comparisonContext.roleSlug}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results grouped by category */}
            {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {categoryLabels[category] || category}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {categoryFlags.length} flags
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {categoryFlags.map((flag) => {
                      const resultA = results[flag.key];
                      const resultB = isComparisonMode ? comparisonResults[flag.key] : null;
                      const isDifferent = resultB && resultA?.enabled !== resultB?.enabled;

                      return (
                        <div
                          key={flag.key}
                          className={cn(
                            'px-4 py-3 flex items-center justify-between gap-4',
                            isDifferent && 'bg-amber-50 dark:bg-amber-900/10'
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{flag.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">{flag.key}</span>
                              {isDifferent && (
                                <Badge className="text-[10px] bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-0">
                                  Diferente
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className={cn(
                            'flex items-center gap-4',
                            isComparisonMode ? 'min-w-[200px] justify-end' : ''
                          )}>
                            {/* Result A */}
                            {resultA && (
                              <div className="flex items-center gap-1.5">
                                {isComparisonMode && (
                                  <span className="text-[10px] text-muted-foreground">A:</span>
                                )}
                                {resultA.enabled ? (
                                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Habilitada
                                  </Badge>
                                ) : (
                                  <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Desabilitada
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Result B */}
                            {isComparisonMode && resultB && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">B:</span>
                                {resultB.enabled ? (
                                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Habilitada
                                  </Badge>
                                ) : (
                                  <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Desabilitada
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!isSimulating && (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <Wand2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Nenhuma simulacao ativa</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Configure o contexto do usuario acima e clique em "Simular" para visualizar como as feature flags se comportam para o cenario selecionado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

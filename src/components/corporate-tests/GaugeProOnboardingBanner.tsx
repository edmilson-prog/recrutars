/**
 * Gauge-Pro Onboarding Banner
 * Banner educacional colapsavel para o Hub de Testes Comportamentais.
 * Explica o que e o Gauge-Pro, o fluxo de trabalho e os beneficios.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  ChevronDown,
  FilePlus,
  Send,
  BarChart3,
  GitCompare,
  Target,
  Clock,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// --- localStorage persistence ---

const DISMISS_KEY = 'recrutars-gauge-pro-onboarding-dismissed';
const COLLAPSE_KEY = 'recrutars-gauge-pro-onboarding-collapsed';

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const val = localStorage.getItem(key);
    return val === null ? fallback : val === 'true';
  } catch {
    return fallback;
  }
}

function saveBool(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // silently ignore
  }
}

// --- Data ---

const workflowSteps = [
  {
    num: '01',
    icon: FilePlus,
    title: 'Crie um Teste',
    desc: 'Defina o perfil comportamental ideal para a vaga e configure as dimensões.',
  },
  {
    num: '02',
    icon: Send,
    title: 'Convide Candidatos',
    desc: 'Envie convites por e-mail ou link. Candidatos completam em ~10 minutos.',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Analise Resultados',
    desc: 'Visualize perfis individuais com gráficos radar e recomendações de IA.',
  },
  {
    num: '04',
    icon: GitCompare,
    title: 'Compare e Decida',
    desc: 'Compare candidatos lado a lado e identifique o melhor fit para sua equipe.',
  },
];

const benefits = [
  {
    icon: Target,
    title: 'Redução de Turnover',
    desc: 'Contratações baseadas em fit comportamental têm até 40% menos rotatividade.',
  },
  {
    icon: Clock,
    title: 'Processo mais Ágil',
    desc: 'Identifique rapidamente candidatos com maior compatibilidade comportamental.',
  },
  {
    icon: Shield,
    title: 'Base Científica',
    desc: 'Metodologia validada com 5 dimensões comportamentais independentes.',
  },
];

// --- Component ---

interface GaugeProOnboardingBannerProps {
  hasTests: boolean;
  onNavigateToCreate: () => void;
  onNavigateToTests: () => void;
  className?: string;
}

export function GaugeProOnboardingBanner({
  hasTests,
  onNavigateToCreate,
  onNavigateToTests,
  className,
}: GaugeProOnboardingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() => loadBool(DISMISS_KEY, false));
  const [isCollapsed, setIsCollapsed] = useState(() => loadBool(COLLAPSE_KEY, false));

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    saveBool(DISMISS_KEY, true);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      saveBool(COLLAPSE_KEY, next);
      return next;
    });
  }, []);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        role="region"
        aria-label="Introdução ao Gauge-Pro"
        className={cn(
          'relative overflow-hidden rounded-2xl p-6',
          'bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5',
          'border border-primary/20',
          'dark:from-primary/10 dark:via-secondary/10 dark:to-primary/10',
          'dark:border-primary/30',
          className
        )}
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-secondary/15 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-tr-full" />

        <div className="relative">
          {/* Header — always visible */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
              <Brain className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground">
                  O que é o Gauge-Pro?
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Guia
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Testes comportamentais científicos para identificar o perfil ideal de cada
                candidato e reduzir erros de contratação.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                aria-expanded={!isCollapsed}
                aria-controls="gauge-pro-onboarding-content"
                aria-label={isCollapsed ? 'Expandir guia' : 'Recolher guia'}
              >
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    isCollapsed && '-rotate-90'
                  )}
                />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Fechar introdução ao Gauge-Pro"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                id="gauge-pro-onboarding-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-6">
                  {/* Workflow steps */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Como funciona
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {workflowSteps.map((step) => (
                        <div
                          key={step.num}
                          className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/50"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <step.icon className="w-4.5 h-4.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="text-xs font-mono text-muted-foreground"
                                aria-hidden="true"
                              >
                                {step.num}
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                {step.title}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Benefícios
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {benefits.map((benefit) => (
                        <div
                          key={benefit.title}
                          className="flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-border/50"
                        >
                          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="w-4.5 h-4.5 text-secondary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-foreground">
                              {benefit.title}
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {benefit.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex justify-end">
                    <Button
                      onClick={hasTests ? onNavigateToTests : onNavigateToCreate}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg shadow-primary/25"
                    >
                      {hasTests ? 'Ver Meus Testes' : 'Criar Primeiro Teste'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

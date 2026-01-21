/**
 * TestIntro Component
 * PRD-047: Teste Geral do Candidato
 *
 * Página de introdução com benefícios e informações do teste
 */

import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Play,
  Sparkles,
  Target,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BEHAVIORAL_TEST_CONFIG } from '@/data/behavioralAssessmentData';

interface TestIntroProps {
  totalQuestions: number;
  estimatedMinutes?: number;
  hasActiveSession: boolean;
  cooldownDays: number | null;
  onStart: () => void;
  onResume: () => void;
}

const benefits = [
  {
    icon: Target,
    title: 'Descubra seu Perfil',
    description: 'Entenda suas características comportamentais e pontos fortes',
  },
  {
    icon: BarChart3,
    title: 'Match Inteligente',
    description: 'Receba vagas mais alinhadas ao seu perfil profissional',
  },
  {
    icon: Trophy,
    title: 'Destaque-se',
    description: 'Empresas valorizam candidatos com perfil comportamental completo',
  },
  {
    icon: Sparkles,
    title: 'Ganhe XP e Badge',
    description: `+${BEHAVIORAL_TEST_CONFIG.xpReward} XP e badge exclusivo ao completar`,
  },
];

export function TestIntro({
  totalQuestions,
  estimatedMinutes = 30,
  hasActiveSession,
  cooldownDays,
  onStart,
  onResume,
}: TestIntroProps) {
  const config = BEHAVIORAL_TEST_CONFIG;

  // Se estiver em cooldown
  if (cooldownDays !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-card rounded-2xl p-8 shadow-soft text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Teste em Cooldown
          </h1>
          <p className="text-muted-foreground mb-6">
            Você já completou o teste comportamental. Um novo teste estará
            disponível em <strong>{cooldownDays} dias</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            O período de cooldown de {config.cooldownDays} dias existe para
            garantir a confiabilidade dos resultados.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 shadow-soft text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Avaliação Comportamental Gauge-Pro
        </h1>
        <p className="text-muted-foreground">
          Descubra seu perfil comportamental através de nossa avaliação
          baseada em ciência. Entenda suas forças, áreas de desenvolvimento e
          receba recomendações personalizadas.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <div className="text-2xl font-bold text-foreground">
            {totalQuestions || `${config.minQuestions}-${config.maxQuestions}`}
          </div>
          <div className="text-sm text-muted-foreground">Perguntas</div>
        </div>
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <div className="text-2xl font-bold text-foreground">
            ~{estimatedMinutes} min
          </div>
          <div className="text-sm text-muted-foreground">Duração</div>
        </div>
        <div className="bg-card p-4 rounded-xl text-center shadow-soft">
          <div className="text-2xl font-bold text-foreground">
            {config.sessionValidDays} dias
          </div>
          <div className="text-sm text-muted-foreground">Para concluir</div>
        </div>
      </motion.div>

      {/* Benefícios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Por que fazer o teste?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Aviso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-warning/10 border border-warning/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground">Importante</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                Responda com sinceridade - não há respostas certas ou erradas
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                Seu progresso é salvo automaticamente - você pode pausar e continuar
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                Você poderá refazer o teste após {config.cooldownDays} dias
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        {hasActiveSession ? (
          <>
            <Button variant="outline" onClick={onStart}>
              <Play className="w-5 h-5 mr-2" />
              Recomeçar
            </Button>
            <Button size="xl" onClick={onResume} className="gradient-primary">
              Continuar Teste
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </>
        ) : (
          <Button size="xl" onClick={onStart} className="gradient-primary">
            Iniciar Teste
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}

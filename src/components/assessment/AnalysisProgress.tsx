/**
 * AnalysisProgress Component
 * PRD-047: Teste Geral do Candidato
 *
 * Tela de "Analisando suas respostas..." com animação
 */

import { motion } from 'framer-motion';
import { Brain, Sparkles, BarChart3, Target } from 'lucide-react';

const steps = [
  { icon: Brain, label: 'Processando respostas', delay: 0 },
  { icon: BarChart3, label: 'Calculando scores', delay: 0.5 },
  { icon: Target, label: 'Identificando padrões', delay: 1 },
  { icon: Sparkles, label: 'Gerando insights', delay: 1.5 },
];

interface AnalysisProgressProps {
  className?: string;
}

export function AnalysisProgress({ className }: AnalysisProgressProps) {
  return (
    <div className={className}>
      <div className="max-w-md mx-auto text-center py-20">
        {/* Animated brain icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl gradient-primary flex items-center justify-center shadow-lg"
        >
          <Brain className="w-12 h-12 text-primary-foreground" />
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          Analisando suas respostas...
        </h2>
        <p className="text-muted-foreground mb-8">
          Estamos processando suas respostas para gerar seu perfil comportamental
        </p>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay }}
              className="flex items-center gap-3 p-3 bg-card rounded-xl"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: step.delay,
                }}
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <step.icon className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">
                {step.label}
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{
                  delay: step.delay + 0.3,
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    delay: step.delay + 0.5,
                    ease: 'linear',
                  }}
                  className="h-full w-1/3 bg-primary rounded-full"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Dots loader */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

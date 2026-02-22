/**
 * OnboardingComplete
 * PRD-086: Congratulations screen after completing all 4 onboarding steps
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { ConfettiTrigger } from '@/components/ui/confetti';
import { AnimatedCheckmark } from '@/components/ui/success-state';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const steps = [
  { label: 'Cadastro verificado com CPF', step: 'Etapa 1' },
  { label: 'Perfil pessoal preenchido', step: 'Etapa 2' },
  { label: 'Perfil profissional completo', step: 'Etapa 3' },
  { label: 'Teste comportamental realizado', step: 'Etapa 4' },
];

export function OnboardingComplete() {
  const { currentCandidate, refreshCurrentCandidate } = useAuth();
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const d = prefersReducedMotion ? 0 : 1; // duration multiplier
  const del = (ms: number) => (prefersReducedMotion ? 0 : ms / 1000); // delay helper (ms → s)

  const handleEnterPlatform = async () => {
    if (!currentCandidate?.id) return;
    setEntering(true);

    try {
      await supabase
        .from('candidates')
        .update({ onboarding_step: 'completed' })
        .eq('id', currentCandidate.id);

      await refreshCurrentCandidate();
      navigate('/candidato');
    } catch {
      // Fallback: navigate anyway
      navigate('/candidato');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti on mount */}
      <ConfettiTrigger trigger={true} variant="default" />

      {/* Decorative background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d * 1.5 }}
          className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d * 1.5, delay: del(200) }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/8 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d * 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-success/[0.03] rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: d * 0.6, delay: del(200), type: 'spring', stiffness: 120, damping: 20 }}
        className="max-w-[660px] w-full text-center space-y-8 relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d * 0.4, delay: del(400) }}
          className="flex items-center justify-center"
        >
          <img
            src="/images/logo-horizontal.png"
            alt="RecrutaRS"
            className="h-14 w-auto dark:hidden"
          />
          <img
            src="/images/logo-horizontal-mono-light.png"
            alt="RecrutaRS"
            className="h-14 w-auto hidden dark:block"
          />
        </motion.div>

        {/* Animated checkmark with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: d * 0.5, delay: del(600), type: 'spring', stiffness: 200 }}
          className="relative mx-auto w-fit"
        >
          <div className="absolute inset-0 bg-success/20 rounded-full blur-2xl scale-[1.8] animate-pulse-soft" />
          <AnimatedCheckmark
            size={96}
            animate={!prefersReducedMotion}
          />
        </motion.div>

        {/* Title & subtitle */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d * 0.5, delay: del(900) }}
            className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
          >
            Parabéns!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d * 0.4, delay: del(1100) }}
            className="text-base sm:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed"
          >
            Seu perfil está completo e pronto para ser
            encontrado pelas melhores empresas.
          </motion.p>
        </div>

        {/* Checklist - redesigned as mini-cards */}
        <div className="space-y-2.5">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: d * 0.4, delay: del(1300 + i * 150) }}
              className="flex items-center gap-3 bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/50 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                  {item.step}
                </span>
                <p className="text-sm font-medium text-foreground leading-tight">
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d * 0.5, delay: del(2000) }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-base shadow-lg hover:shadow-xl transition-all"
            onClick={handleEnterPlatform}
            disabled={entering}
          >
            {entering ? 'Entrando...' : 'Acessar Plataforma'}
            {!entering && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * OnboardingComplete
 * PRD-086: Congratulations screen after completing all 4 onboarding steps
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PartyPopper, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export function OnboardingComplete() {
  const { currentCandidate, refreshCurrentCandidate } = useAuth();
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="flex items-center justify-center">
          <img
            src="/images/logo-horizontal.png"
            alt="RecrutaRS"
            className="h-10 w-auto"
          />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"
        >
          <PartyPopper className="w-12 h-12 text-green-500" />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Parabens!
          </h1>
          <p className="text-lg text-muted-foreground">
            Seu perfil esta completo e pronto para ser encontrado pelas melhores empresas.
          </p>
        </div>

        <div className="space-y-2 text-left bg-card rounded-xl p-4 border">
          {[
            'Cadastro verificado com CPF',
            'Perfil pessoal preenchido',
            'Perfil profissional completo',
            'Teste comportamental realizado',
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleEnterPlatform}
          disabled={entering}
        >
          {entering ? 'Entrando...' : 'Acessar Plataforma'}
          {!entering && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </motion.div>
    </div>
  );
}

/**
 * TestEmptyState — Empty states for "Meus Testes" hub
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestEmptyStateProps {
  variant: 'global' | 'filter';
  filterLabel?: string;
}

export function TestEmptyState({ variant, filterLabel }: TestEmptyStateProps) {
  const navigate = useNavigate();

  if (variant === 'global') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center py-16 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Você ainda não realizou nenhum teste
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Testes comportamentais ajudam empresas a entenderem seu perfil e aumentam suas chances de ser encontrado. Comece agora!
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/candidato/gauge-pro')}
          className="gradient-primary"
        >
          Fazer meu primeiro teste
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-12 px-4"
    >
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Nenhum teste {filterLabel || 'encontrado'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {filterLabel === 'voluntário'
          ? 'Você ainda não fez nenhum teste por conta própria. Que tal começar um agora?'
          : 'Nenhuma empresa solicitou testes para você ainda.'}
      </p>
    </motion.div>
  );
}

import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Part1CompleteProps {
  onContinue: () => void;
}

export function Part1Complete({ onContinue }: Part1CompleteProps) {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
        <CheckCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-emerald-400">Parte 1 Concluída!</h2>
        <p className="text-muted-foreground">
          Suas seleções de palavras foram registradas. Agora vamos para a segunda parte: cenários situacionais.
        </p>
      </div>
      <Button onClick={onContinue} size="lg" className="gap-2">
        Continuar para Parte 2 <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

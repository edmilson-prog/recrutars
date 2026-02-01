import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';

interface ScenarioIntroProps {
  onStart: () => void;
}

export function ScenarioIntro({ onStart }: ScenarioIntroProps) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 text-indigo-600">
        <MessageSquare className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Parte 2 — Cenários Situacionais</h2>
        <p className="text-gray-600">
          Você verá {GAUGE_PRO_CONFIG.part2.totalScenarios} situações profissionais. Em cada uma, escolha a opção que melhor descreve como você agiria.
        </p>
      </div>
      <ul className="text-sm text-gray-500 space-y-1 text-left max-w-sm mx-auto">
        <li>• Leia a situação com atenção</li>
        <li>• Escolha a opção mais próxima do que você realmente faria</li>
        <li>• Não há respostas certas ou erradas</li>
        <li>• Você pode voltar e alterar respostas</li>
      </ul>
      <Button onClick={onStart} size="lg" className="gap-2">
        Começar Cenários <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

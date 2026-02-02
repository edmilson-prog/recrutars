import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WordSelectionIntroProps {
  onStart: () => void;
}

export function WordSelectionIntro({ onStart }: WordSelectionIntroProps) {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-100 text-cyan-600">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Parte 1 — Seleção de Palavras</h2>
        <p className="text-gray-600">
          Você verá uma lista de adjetivos. Selecione exatamente <strong>5 palavras</strong> em cada etapa.
        </p>
      </div>

      <div className="space-y-3">
        <Card className="border-cyan-200 bg-cyan-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-cyan-800">Lista A — Como você realmente é</p>
            <p className="text-sm text-cyan-600 mt-1">
              Escolha 5 palavras que melhor descrevem quem você é de verdade no trabalho.
            </p>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-indigo-800">Lista B — Como outros esperam que você seja</p>
            <p className="text-sm text-indigo-600 mt-1">
              Escolha 5 palavras que descrevem como você acredita que colegas e gestores esperam que você seja.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={onStart} size="lg" className="gap-2">
          Começar Seleção <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

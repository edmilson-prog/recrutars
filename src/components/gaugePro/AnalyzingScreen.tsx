import { Loader2, Brain } from 'lucide-react';

export function AnalyzingScreen() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="relative inline-flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-test-self-bg animate-ping opacity-30" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-test-self-bg text-test-self-icon">
          <Brain className="w-10 h-10" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Analisando seu perfil...
        </h2>
        <p className="text-muted-foreground">
          Combinando suas respostas das duas partes para determinar seu perfil comportamental.
        </p>
      </div>
    </div>
  );
}

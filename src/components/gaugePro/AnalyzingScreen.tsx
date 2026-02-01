import { Loader2, Brain } from 'lucide-react';

export function AnalyzingScreen() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-12">
      <div className="relative inline-flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-cyan-100 animate-ping opacity-30" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-100 text-cyan-600">
          <Brain className="w-10 h-10" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Analisando seu perfil...
        </h2>
        <p className="text-gray-500">
          Combinando suas respostas das duas partes para determinar seu perfil comportamental.
        </p>
      </div>
    </div>
  );
}

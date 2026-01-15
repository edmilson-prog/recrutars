/**
 * Visibility Settings Component
 * PRD-026: Visibilidade do Perfil do Candidato
 */

import { useState } from 'react';
import {
  Globe,
  Eye,
  Lock,
  Check,
  AlertTriangle,
  Shield,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { VisibilityMode } from '@/types/candidate';

interface VisibilitySettingsProps {
  currentMode: VisibilityMode;
  anonymousId: string;
  onSave: (mode: VisibilityMode) => void;
}

interface ModeOption {
  value: VisibilityMode;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  warning?: string;
  recommended?: boolean;
}

const modeOptions: ModeOption[] = [
  {
    value: 'public',
    icon: Globe,
    title: 'Público',
    description:
      'Seu perfil é visível em todas as buscas da IA e das empresas. Você receberá mais oportunidades e convites diretos. Informações como nome, foto, experiências e habilidades ficam disponíveis para visualização.',
    benefits: [
      'Máxima visibilidade',
      'Recebe convites diretos',
      'Aparece em recomendações da IA',
    ],
    recommended: true,
  },
  {
    value: 'partial',
    icon: Eye,
    title: 'Parcial (Anônimo)',
    description:
      'A IA usa seu perfil completo para ranqueamento e recomendações, mas oculta informações pessoais identificáveis (nome, foto e empresa atual) das empresas.',
    benefits: [
      'Aparece nas buscas como anônimo',
      'Habilidades e experiência visíveis',
      'Nome revelado só após aceitar convite',
    ],
    warning:
      'Ideal para quem está empregado e quer explorar o mercado discretamente',
  },
  {
    value: 'private',
    icon: Lock,
    title: 'Privado',
    description:
      'Seu perfil não aparece em nenhuma busca ou recomendação automática do sistema. Você só será visível para empresas quando se candidatar ativamente a uma vaga.',
    benefits: [
      'Controle total da privacidade',
      'Visível apenas ao se candidatar',
    ],
    warning:
      'Neste modo, você não receberá convites diretos nem recomendações personalizadas da IA.',
  },
];

// Tabela comparativa
const comparisonTable = [
  { feature: 'Aparece nas buscas', public: true, partial: true, private: false },
  { feature: 'Recebe convites', public: true, partial: true, private: false },
  { feature: 'Recomendações da IA', public: true, partial: true, private: false },
  { feature: 'Nome visível', public: true, partial: false, private: false },
  { feature: 'Foto visível', public: true, partial: false, private: false },
  { feature: 'Habilidades visíveis', public: true, partial: true, private: false },
  { feature: 'Experiências visíveis', public: true, partial: true, private: false },
  { feature: 'Empresa atual visível', public: true, partial: false, private: false },
];

export function VisibilitySettings({
  currentMode,
  anonymousId,
  onSave,
}: VisibilitySettingsProps) {
  const [selectedMode, setSelectedMode] = useState<VisibilityMode>(currentMode);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = selectedMode !== currentMode;

  const handleSave = async () => {
    setIsSaving(true);
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(selectedMode);
    setIsSaving(false);
    toast.success('Configurações de visibilidade salvas');
  };

  const handleCancel = () => {
    setSelectedMode(currentMode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Modo de Visibilidade
        </CardTitle>
        <CardDescription>
          Escolha como deseja aparecer nas buscas do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radio Group com opções */}
        <RadioGroup
          value={selectedMode}
          onValueChange={(value) => setSelectedMode(value as VisibilityMode)}
          className="space-y-4"
        >
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedMode === option.value;

            return (
              <div
                key={option.value}
                className={cn(
                  'relative rounded-xl border-2 p-4 transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setSelectedMode(option.value)}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <Label
                      htmlFor={option.value}
                      className="flex items-center gap-2 text-base font-medium cursor-pointer"
                    >
                      <Icon className="w-5 h-5" />
                      {option.title}
                      {option.recommended && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Padrão
                        </span>
                      )}
                      {option.value === 'partial' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium mb-1">Como funciona:</p>
                            <ul className="text-xs space-y-1">
                              <li>• As empresas veem apenas "Perfil Anônimo #{anonymousId}"</li>
                              <li>• Suas habilidades e experiências são visíveis</li>
                              <li>• Seu nome só é revelado após aceitar um convite</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-2">
                      {option.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="inline-flex items-center gap-1 text-xs text-success"
                        >
                          <Check className="w-3 h-3" />
                          {benefit}
                        </span>
                      ))}
                    </div>

                    {/* Warning */}
                    {option.warning && (
                      <Alert
                        variant={option.value === 'private' ? 'destructive' : 'default'}
                        className="mt-3"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {option.warning}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Mostrar ID anônimo quando modo parcial está selecionado */}
        {selectedMode === 'partial' && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-1">
              Seu identificador anônimo:
            </p>
            <p className="text-lg font-mono text-primary">
              Perfil Anônimo #{anonymousId}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Este é o nome que as empresas verão ao buscar no banco de talentos.
            </p>
          </div>
        )}

        {/* Botões de ação */}
        {hasChanges && (
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
          </div>
        )}

        {/* Dica de segurança */}
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Dica de Segurança
            </p>
            <p className="text-xs text-muted-foreground">
              Independente do modo escolhido, nunca compartilhamos seus dados pessoais
              com terceiros sem sua autorização. Todas as configurações podem ser
              alteradas a qualquer momento.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

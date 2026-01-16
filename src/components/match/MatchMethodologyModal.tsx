/**
 * Match Methodology Modal
 * PRD-035: Transparência e Explicabilidade do Matching
 *
 * Modal explicando como o match score é calculado
 * Mostra pesos, metodologia e garantias de privacidade
 */

import { HelpCircle, Shield, Code2, GraduationCap, Brain, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MatchMethodologyModalProps {
  trigger?: React.ReactNode;
  className?: string;
}

const METHODOLOGY_CATEGORIES = [
  {
    id: "skills",
    name: "Skills Técnicas",
    weight: 40,
    icon: Code2,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
    description:
      "Comparamos suas habilidades técnicas com os requisitos da vaga. Quanto mais skills você tiver em comum, maior o score.",
    example: "Se a vaga pede React, Node.js e TypeScript, e você tem essas skills no perfil, seu score será alto.",
  },
  {
    id: "experience",
    name: "Experiência",
    weight: 30,
    icon: GraduationCap,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/30",
    description:
      "Avaliamos se seus anos de experiência são compatíveis com o nível da vaga (Júnior, Pleno, Senior).",
    example: "Uma vaga Senior espera 5+ anos. Com 6 anos de experiência, você terá um score alto.",
  },
  {
    id: "behavioral",
    name: "Perfil Comportamental",
    weight: 20,
    icon: Brain,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-950/30",
    description:
      "Comparamos seu perfil DISC com o perfil ideal definido pela empresa para a posição.",
    example: "Uma vaga de liderança pode buscar perfil alto em D (Dominância). Se seu perfil é compatível, o score aumenta.",
  },
  {
    id: "location",
    name: "Localização",
    weight: 10,
    icon: MapPin,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950/30",
    description:
      "Verificamos a compatibilidade entre sua localização e o modelo de trabalho da vaga.",
    example: "Vagas remotas = 100% sempre. Mesma cidade = 100%. Mesmo estado = 70-85%.",
  },
];

export function MatchMethodologyModal({
  trigger,
  className,
}: MatchMethodologyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 text-muted-foreground hover:text-foreground", className)}
          >
            <HelpCircle className="w-4 h-4" />
            Como calculamos?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-5 h-5 text-cyan-500" />
            Como calculamos seu Match Score?
          </DialogTitle>
          <DialogDescription>
            Entenda como analisamos a compatibilidade entre seu perfil e cada vaga
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Introdução */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              O Match Score é uma pontuação de <strong>0 a 100%</strong> que indica
              o quanto seu perfil é compatível com uma vaga. Quanto maior o score,
              maior a probabilidade de você ser um bom fit para a posição.
            </p>
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Critérios avaliados</h3>

            {METHODOLOGY_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        category.bgColor
                      )}
                    >
                      <Icon className={cn("w-5 h-5", category.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-foreground">
                          {category.name}
                        </h4>
                        <span className="text-sm font-semibold text-muted-foreground">
                          {category.weight}%
                        </span>
                      </div>
                      <Progress
                        value={category.weight}
                        className="h-1.5 mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                    <strong>Exemplo:</strong> {category.example}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fórmula simplificada */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold text-foreground mb-2">Fórmula</h3>
            <code className="text-sm bg-muted px-2 py-1 rounded block">
              Match = (Skills × 40%) + (Experiência × 30%) + (DISC × 20%) + (Localização × 10%)
            </code>
          </div>

          {/* Garantias de privacidade */}
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Privacidade e Transparência
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>
                      Não usamos dados sensíveis como idade, gênero, etnia ou estado civil
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>
                      Apenas informações profissionais são consideradas no cálculo
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>
                      Você pode ver exatamente o que influencia seu score
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>
                      O score é apenas uma sugestão - a decisão final é sempre humana
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Link para política de privacidade */}
          <div className="flex justify-center pt-2">
            <Button variant="link" size="sm" className="text-muted-foreground" asChild>
              <a href="/politica-privacidade" target="_blank" rel="noopener noreferrer">
                Ver Política de Privacidade
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Versão inline (apenas botão com tooltip simples)
export function MatchMethodologyButton({
  className,
}: {
  className?: string;
}) {
  return (
    <MatchMethodologyModal
      trigger={
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
            className
          )}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Como funciona?
        </button>
      }
    />
  );
}

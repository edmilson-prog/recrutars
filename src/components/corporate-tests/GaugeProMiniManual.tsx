/**
 * GaugeProMiniManual - Sheet lateral com guia passo a passo
 * Ensina empresas COMO aplicar testes Gauge-Pro
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Lightbulb,
  ClipboardList,
  Send,
  UserCheck,
  BarChart3,
  GitCompareArrows,
} from 'lucide-react';

const STORAGE_KEY = 'recrutars-gauge-manual-seen';

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/20 p-3 mt-3">
      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="text-xs text-primary/90 leading-relaxed">{children}</p>
    </div>
  );
}

function SectionNumber({ n }: { n: number }) {
  return (
    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
      {String(n).padStart(2, '0')}
    </span>
  );
}

export function GaugeProMiniManual() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (open && !seen) {
      setSeen(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
    }
  }, [open, seen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-2" />
          Mini Manual
          {!seen && (
            <Badge className="text-[10px] ml-2 px-1.5 py-0">Novo</Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Mini Manual Gauge-Pro</SheetTitle>
              <SheetDescription>
                Guia passo a passo para aplicar testes comportamentais
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            <Accordion type="single" collapsible defaultValue="item-1">
              {/* 1. Criando um Teste */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <SectionNumber n={1} />
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      <span>Criando um Teste</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed ml-9">
                    <li>Escolha entre <strong className="text-foreground">7 templates</strong>: Padrão, Liderança, Operacional, Vendas, Técnico, Criativo ou Personalizado.</li>
                    <li>O template define os pesos das <strong className="text-foreground">5 dimensões comportamentais</strong> (D1-D5). Apenas o template "Personalizado" permite ajuste manual.</li>
                    <li>Preencha: nome do teste, descrição, vaga alvo, prazo de expiração e instruções para os candidatos.</li>
                  </ul>
                  <TipBox>
                    Comece pelo template mais próximo da vaga. Você pode criar um teste personalizado depois, quando tiver mais experiência com os resultados.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Convidando Candidatos */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <SectionNumber n={2} />
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span>Convidando Candidatos</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed ml-9">
                    <li><strong className="text-foreground">3 formas de convidar:</strong> email individual, link público compartilhável ou seleção do banco interno de candidatos.</li>
                    <li>Acompanhe o status de cada convite:
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-[10px]">Pendente</Badge>
                        <span className="text-muted-foreground/50">→</span>
                        <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Em andamento</Badge>
                        <span className="text-muted-foreground/50">→</span>
                        <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Concluído</Badge>
                        <span className="text-muted-foreground/50">→</span>
                        <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">Expirado</Badge>
                      </div>
                    </li>
                  </ul>
                  <TipBox>
                    Use o link público para processos seletivos com muitos candidatos. É mais rápido que enviar emails individualmente.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* 3. O que o Candidato Faz */}
              <AccordionItem value="item-3">
                <AccordionTrigger className="hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <SectionNumber n={3} />
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span>O que o Candidato Faz</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed ml-9">
                    <li><strong className="text-foreground">Parte 1 (~15 min):</strong> seleciona 5 adjetivos que o descrevem + 5 que outros esperam dele. São 100 palavras organizadas em 5 dimensões.</li>
                    <li><strong className="text-foreground">Parte 2 (~20 min):</strong> responde 15 cenários profissionais escolhendo entre as opções A, B, C ou D.</li>
                    <li>Não há respostas certas ou erradas — o teste mede o perfil comportamental natural do candidato.</li>
                    <li>Cooldown: o candidato pode refazer o teste após <strong className="text-foreground">180 dias</strong>.</li>
                  </ul>
                  <TipBox>
                    Oriente seus candidatos a responder com calma e honestidade. Os melhores resultados vêm de respostas autênticas, não "ideais".
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Analisando Resultados */}
              <AccordionItem value="item-4">
                <AccordionTrigger className="hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <SectionNumber n={4} />
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>Analisando Resultados</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed ml-9">
                    <li><strong className="text-foreground">Gráfico radar</strong> com as 5 dimensões comportamentais (escala 0-100).</li>
                    <li><strong className="text-foreground">16 arquétipos</strong> possíveis (ex: "O Comandante", "O Facilitador", "O Estrategista").</li>
                    <li>Recomendações da <strong className="text-foreground">IA</strong> sobre compatibilidade com a vaga.</li>
                    <li>Detalhamento de pontos fortes e áreas de desenvolvimento do candidato.</li>
                  </ul>
                  <TipBox>
                    Compare o radar do candidato com o perfil ideal definido no template. Quanto mais próximos os formatos, maior a compatibilidade.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>

              {/* 5. Comparando Candidatos */}
              <AccordionItem value="item-5" className="border-b-0">
                <AccordionTrigger className="hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <SectionNumber n={5} />
                    <div className="flex items-center gap-2">
                      <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
                      <span>Comparando Candidatos</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed ml-9">
                    <li><strong className="text-foreground">Compare lado a lado</strong> com sobreposição de gráficos radar.</li>
                    <li><strong className="text-foreground">Ranking de compatibilidade</strong> com o perfil ideal da vaga.</li>
                    <li>Exporte relatórios em <strong className="text-foreground">Excel</strong> e <strong className="text-foreground">PDF</strong> para compartilhar com a equipe.</li>
                  </ul>
                  <TipBox>
                    Use a shortlist para filtrar os candidatos mais promissores antes de fazer comparações detalhadas.
                  </TipBox>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

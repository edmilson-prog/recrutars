/**
 * AccessibilityPanel Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 *
 * Painel de configurações de acessibilidade
 * Permite ajustar: fonte, espaçamento, animações, contraste
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Type,
  AlignJustify,
  Sparkles,
  Contrast,
  RotateCcw,
  X,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  useAccessibility,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_MAX,
} from '@/contexts/AccessibilityContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AccessibilityPanelProps {
  triggerClassName?: string;
}

export function AccessibilityPanel({ triggerClassName }: AccessibilityPanelProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const {
    prefs,
    setFontSize,
    setLineHeight,
    setReduceMotion,
    setHighContrast,
    resetToDefaults,
    isDefault,
  } = useAccessibility();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("touch-target", triggerClassName)}
          aria-label="Configurações de acessibilidade"
        >
          <Accessibility className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-primary" />
            Acessibilidade
          </SheetTitle>
          <SheetDescription>
            Personalize a experiência de acordo com suas necessidades
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Tamanho da Fonte */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Tamanho da Fonte</Label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[prefs.fontSize]}
                onValueChange={([value]) => setFontSize(value)}
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                step={1}
                className="touch-target-sm"
                aria-label={`Tamanho da fonte: ${prefs.fontSize}px`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{FONT_SIZE_MIN}px</span>
                <span className="font-medium text-foreground">{prefs.fontSize}px</span>
                <span>{FONT_SIZE_MAX}px</span>
              </div>
            </div>
            {/* Preview */}
            <div
              className="p-3 bg-muted rounded-lg"
              style={{ fontSize: `${prefs.fontSize}px` }}
            >
              <p>Texto de exemplo para visualização</p>
            </div>
          </div>

          {/* Espaçamento de Linhas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlignJustify className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Espaçamento de Linhas</Label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[prefs.lineHeight * 10]} // Multiplicar por 10 para step de 0.1
                onValueChange={([value]) => setLineHeight(value / 10)}
                min={LINE_HEIGHT_MIN * 10}
                max={LINE_HEIGHT_MAX * 10}
                step={1}
                className="touch-target-sm"
                aria-label={`Espaçamento de linhas: ${prefs.lineHeight.toFixed(1)}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{LINE_HEIGHT_MIN.toFixed(1)}</span>
                <span className="font-medium text-foreground">
                  {prefs.lineHeight.toFixed(1)}
                </span>
                <span>{LINE_HEIGHT_MAX.toFixed(1)}</span>
              </div>
            </div>
            {/* Preview */}
            <div
              className="p-3 bg-muted rounded-lg text-sm"
              style={{ lineHeight: prefs.lineHeight }}
            >
              <p>
                Este é um exemplo de texto com múltiplas linhas para
                demonstrar o espaçamento entre elas. Ajuste o controle acima
                para ver a diferença.
              </p>
            </div>
          </div>

          {/* Reduzir Animações */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Reduzir Animações</Label>
                <p className="text-xs text-muted-foreground">
                  Minimiza movimentos e transições
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.reduceMotion}
              onCheckedChange={setReduceMotion}
              aria-label="Reduzir animações"
            />
          </div>

          {/* Alto Contraste */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Alto Contraste</Label>
                <p className="text-xs text-muted-foreground">
                  Aumenta contraste de cores
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.highContrast}
              onCheckedChange={setHighContrast}
              aria-label="Alto contraste"
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isDefault}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Botão flutuante de acessibilidade
 * Para uso em páginas públicas
 */
export function AccessibilityFAB() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-40 md:bottom-4"
      initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 25 }}
    >
      <AccessibilityPanel
        triggerClassName="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      />
    </motion.div>
  );
}

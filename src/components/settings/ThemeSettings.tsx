/**
 * ThemeSettings Component
 * PRD-029: Tema Dark/Light Mode - Seção de Aparência
 */

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro para uso diurno',
    },
    {
      value: 'dark',
      label: 'Escuro',
      icon: Moon,
      description: 'Tema escuro para reduzir cansaço visual',
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: Monitor,
      description: 'Seguir preferência do sistema operacional',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Escolha o tema de cores da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={theme} onValueChange={setTheme}>
          <div className="grid gap-4 md:grid-cols-3">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <Label
                  key={themeOption.value}
                  htmlFor={themeOption.value}
                  className="flex cursor-pointer flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem
                    value={themeOption.value}
                    id={themeOption.value}
                    className="sr-only"
                  />
                  <Icon className="mb-3 h-12 w-12 text-muted-foreground" />
                  <div className="space-y-1 text-center">
                    <p className="font-semibold">{themeOption.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </p>
                  </div>
                </Label>
              );
            })}
          </div>
        </RadioGroup>

        <div className="rounded-lg border border-border/50 bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">Sobre a Fonte</h4>
          <p className="text-sm text-muted-foreground">
            A plataforma utiliza a fonte <strong>Roboto Mono</strong> para melhor
            legibilidade e identidade visual moderna.
          </p>
          <p className="mt-3 font-mono text-sm">
            Exemplo: AaBbCcDdEe 0123456789
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

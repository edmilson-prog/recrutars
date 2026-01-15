/**
 * ContactInfo Component
 * PRD-028: Central de Ajuda - Contact Information Display
 */

import { Mail, Phone, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ContactInfo() {
  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'suporte@recrutars.com.br',
      description: 'Resposta em até 24h',
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: '(51) 3000-0000',
      description: 'Seg-Sex 9h às 18h',
    },
    {
      icon: Clock,
      label: 'Horário de Atendimento',
      value: 'Segunda a Sexta',
      description: '9h às 18h',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {contactMethods.map((method) => {
        const Icon = method.icon;
        return (
          <Card key={method.label} className="border-border/50 bg-card/50">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{method.label}</h3>
                <p className="mt-1 text-sm font-medium text-foreground/90">
                  {method.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * DeveloperCard Component
 * PRD-044: Card com informacoes do desenvolvedor
 */

import { ExternalLink, Code2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APP_COMPANY, APP_COMPANY_URL } from '@/constants/app';

export function DeveloperCard() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Desenvolvido por
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo placeholder and company name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border">
            <span className="text-2xl font-bold text-primary">A</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{APP_COMPANY}</h3>
            <p className="text-sm text-muted-foreground">
              Tecnologia e Inovacao
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          Desenvolvemos solucoes inteligentes para recrutamento e gestao de talentos,
          combinando tecnologia de ponta com analise comportamental para conectar
          empresas aos melhores candidatos.
        </p>

        {/* CTA */}
        <Button
          variant="outline"
          className="w-full"
          asChild
        >
          <a
            href={APP_COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visitar site
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

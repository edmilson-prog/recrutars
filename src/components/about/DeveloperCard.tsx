/**
 * DeveloperCard Component
 * PRD-044: Card com informações do desenvolvedor
 */

import { ExternalLink, Code2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APP_COMPANY, APP_COMPANY_URL } from '@/constants/app';

export function DeveloperCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Logo e nome da empresa */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border shrink-0">
              <span className="text-xl font-bold text-primary">A</span>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-0.5">
                <Code2 className="w-4 h-4" />
                Desenvolvido por
              </div>
              <h3 className="font-semibold">{APP_COMPANY}</h3>
            </div>
          </div>

          {/* Descrição - flex-1 para ocupar espaço */}
          <p className="flex-1 text-sm text-muted-foreground md:border-l md:pl-6">
            Desenvolvemos soluções inteligentes para recrutamento e gestão de talentos,
            combinando tecnologia de ponta com análise comportamental para conectar
            empresas aos melhores candidatos.
          </p>

          {/* Botão no final */}
          <Button
            variant="outline"
            className="shrink-0"
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
        </div>
      </CardContent>
    </Card>
  );
}

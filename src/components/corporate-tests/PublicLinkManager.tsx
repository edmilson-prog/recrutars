/**
 * Public Link Manager
 * PRD-052: Geração/gestão de link público
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, Copy, Check, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/utils/auditLog';

interface PublicLinkManagerProps {
  testId: string;
  testName: string;
  existingSlug?: string;
  isActive?: boolean;
}

export function PublicLinkManager({ testId, testName, existingSlug, isActive = false }: PublicLinkManagerProps) {
  const { toast } = useToast();
  const [slug, setSlug] = useState(existingSlug || '');
  const [active, setActive] = useState(isActive);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(!!existingSlug);

  const link = `${window.location.origin}/t/${slug}`;

  const generateLink = () => {
    const newSlug = slug.trim() || `teste-${Date.now().toString(36)}`;
    setSlug(newSlug);
    setGenerated(true);
    setActive(true);
    addAuditLog('link_generated', 'user-comp-1', 'Maria Recrutadora', 'test', testId, testName, `Slug: ${newSlug}`);
    toast({ title: 'Link gerado', description: 'Link público criado com sucesso.' });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Link copiado' });
  };

  const toggleActive = () => {
    const newActive = !active;
    setActive(newActive);
    if (!newActive) {
      addAuditLog('link_deactivated', 'user-comp-1', 'Maria Recrutadora', 'test', testId, testName);
    }
    toast({
      title: newActive ? 'Link ativado' : 'Link desativado',
      description: newActive ? 'Candidatos podem usar o link.' : 'O link não aceita mais acessos.',
    });
  };

  return (
    <div className="space-y-4">
      {!generated ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Slug personalizado (opcional)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
              placeholder="ex: gerente-projetos-2026"
            />
          </div>
          <Button onClick={generateLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Gerar Link Público
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={active ? 'default' : 'secondary'}>
                {active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input value={link} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleActive}>
              <Unlink className="h-4 w-4 mr-2" />
              {active ? 'Desativar link' : 'Reativar link'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

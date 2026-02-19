/**
 * Public Link Manager
 * PRD-052: Geração/gestão de link público — Supabase-backed
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, Copy, Check, Unlink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdatePublicLink } from '@/hooks/useCompanyTestsQuery';

interface PublicLinkManagerProps {
  testId: string;
  testName: string;
  existingSlug?: string;
  isActive?: boolean;
}

export function PublicLinkManager({ testId, testName, existingSlug, isActive = false }: PublicLinkManagerProps) {
  const { toast } = useToast();
  const [slug, setSlug] = useState(existingSlug || '');
  const [copied, setCopied] = useState(false);
  const updatePublicLink = useUpdatePublicLink();

  const hasLink = !!existingSlug;
  const link = `${window.location.origin}/teste/${existingSlug || slug}`;

  const generateLink = async () => {
    const newSlug = slug.trim() || `teste-${Date.now().toString(36)}`;
    await updatePublicLink.mutateAsync({
      testId,
      slug: newSlug,
      active: true,
    });
    setSlug(newSlug);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Link copiado' });
  };

  const toggleActive = async () => {
    await updatePublicLink.mutateAsync({
      testId,
      slug: existingSlug || slug,
      active: !isActive,
    });
  };

  return (
    <div className="space-y-4">
      {!hasLink ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Slug personalizado (opcional)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
              placeholder="ex: gerente-projetos-2026"
              disabled={updatePublicLink.isPending}
            />
          </div>
          <Button onClick={generateLink} disabled={updatePublicLink.isPending}>
            {updatePublicLink.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4 mr-2" />
            )}
            Gerar Link Público
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input value={link} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleActive}
              disabled={updatePublicLink.isPending}
            >
              {updatePublicLink.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              {isActive ? 'Desativar link' : 'Reativar link'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

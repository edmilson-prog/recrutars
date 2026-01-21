/**
 * MagicLinkGenerator Component
 * PRD-048: Teste por Vaga
 *
 * Gerador de links mágicos para candidatos externos
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Copy,
  Check,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MagicLinkGeneratorProps {
  jobAssessmentId: string;
  currentLinkCount: number;
  maxLinks: number;
  defaultExpirationDays: number;
  onGenerate: (data: {
    externalName?: string;
    externalEmail?: string;
    expirationDays: number;
  }) => Promise<string>;
  className?: string;
}

export function MagicLinkGenerator({
  jobAssessmentId,
  currentLinkCount,
  maxLinks,
  defaultExpirationDays,
  onGenerate,
  className,
}: MagicLinkGeneratorProps) {
  const { toast } = useToast();
  const [externalName, setExternalName] = useState('');
  const [externalEmail, setExternalEmail] = useState('');
  const [expirationDays, setExpirationDays] = useState(defaultExpirationDays);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canGenerate = currentLinkCount < maxLinks;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const link = await onGenerate({
        externalName: externalName || undefined,
        externalEmail: externalEmail || undefined,
        expirationDays,
      });
      setGeneratedLink(link);
      toast({
        title: 'Link gerado!',
        description: 'O link foi gerado com sucesso.',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Link copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewLink = () => {
    setGeneratedLink(null);
    setExternalName('');
    setExternalEmail('');
    setCopied(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Link Mágico
          </h3>
          <p className="text-sm text-muted-foreground">
            Gere um link para candidatos externos
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentLinkCount}/{maxLinks} links
        </div>
      </div>

      {!canGenerate && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Limite de links atingido
              </p>
              <p className="text-muted-foreground">
                Você atingiu o limite de {maxLinks} links para esta vaga.
              </p>
            </div>
          </div>
        </div>
      )}

      {generatedLink ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success/10 border border-success/20 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-success">
            <Check className="w-5 h-5" />
            <span className="font-medium">Link gerado com sucesso!</span>
          </div>

          {/* Link display */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Link de acesso</Label>
            <div className="flex gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="font-mono text-sm bg-background"
              />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(generatedLink, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Info */}
          {(externalName || externalEmail) && (
            <div className="text-sm text-muted-foreground space-y-1">
              {externalName && (
                <p>
                  <User className="w-4 h-4 inline mr-1" />
                  Destinatário: {externalName}
                </p>
              )}
              {externalEmail && (
                <p>
                  <Mail className="w-4 h-4 inline mr-1" />
                  E-mail: {externalEmail}
                </p>
              )}
              <p>
                <Calendar className="w-4 h-4 inline mr-1" />
                Válido por {expirationDays} dias
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleNewLink}
            className="w-full"
          >
            Gerar outro link
          </Button>
        </motion.div>
      ) : (
        canGenerate && (
          <div className="space-y-4 bg-card rounded-xl p-4">
            {/* Nome (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="external-name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome do candidato (opcional)
              </Label>
              <Input
                id="external-name"
                value={externalName}
                onChange={(e) => setExternalName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>

            {/* Email (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="external-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail do candidato (opcional)
              </Label>
              <Input
                id="external-email"
                type="email"
                value={externalEmail}
                onChange={(e) => setExternalEmail(e.target.value)}
                placeholder="Ex: joao@email.com"
              />
            </div>

            {/* Validade */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Validade do link
              </Label>
              <Select
                value={expirationDays.toString()}
                onValueChange={(v) => setExpirationDays(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gradient-primary"
            >
              <Link2 className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Link Mágico'}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

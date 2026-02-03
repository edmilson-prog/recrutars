/**
 * EmailTemplateEditor Component
 * PRD-058: Editor de templates de e-mail com variaveis
 */

import { Mail, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface EmailTemplateEditorProps {
  templates: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const TEMPLATE_CONFIG: Record<string, { label: string; variables: string[] }> = {
  approved: {
    label: 'Aprovacao',
    variables: ['{{companyName}}', '{{jobTitle}}'],
  },
  rejected: {
    label: 'Rejeicao',
    variables: ['{{companyName}}', '{{jobTitle}}', '{{rejectionReason}}'],
  },
  correction_requested: {
    label: 'Correcao',
    variables: ['{{companyName}}', '{{jobTitle}}', '{{correctionFields}}'],
  },
  expiring: {
    label: 'Expiracao',
    variables: ['{{companyName}}', '{{jobTitle}}', '{{daysRemaining}}'],
  },
};

export function EmailTemplateEditor({ templates, onChange }: EmailTemplateEditorProps) {
  const templateKeys = Object.keys(TEMPLATE_CONFIG);

  return (
    <Tabs defaultValue={templateKeys[0]} className="w-full">
      <TabsList className="w-full flex">
        {templateKeys.map((key) => (
          <TabsTrigger key={key} value={key} className="flex-1 text-xs sm:text-sm">
            <Mail className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />
            {TEMPLATE_CONFIG[key].label}
          </TabsTrigger>
        ))}
      </TabsList>

      {templateKeys.map((key) => (
        <TabsContent key={key} value={key} className="space-y-3 mt-4">
          <div>
            <Label className="text-sm font-medium">
              Template de {TEMPLATE_CONFIG[key].label}
            </Label>
            <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Variaveis disponiveis:</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {TEMPLATE_CONFIG[key].variables.map((v) => (
                <Badge key={v} variant="secondary" className="text-[10px] font-mono">
                  {v}
                </Badge>
              ))}
            </div>
          </div>

          <Textarea
            value={templates[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
            rows={5}
            className="font-mono text-sm"
            placeholder={`Template de e-mail para ${TEMPLATE_CONFIG[key].label}...`}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

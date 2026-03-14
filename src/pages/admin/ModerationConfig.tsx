/**
 * ModerationConfig Page
 * PRD-058: Configuracoes de moderacao, regras, templates e motivos
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useModeration } from '@/hooks/useModeration';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ModerationRulesEditor } from '@/components/admin/jobs/ModerationRulesEditor';
import { EmailTemplateEditor } from '@/components/admin/jobs/EmailTemplateEditor';
import type { ModerationMode } from '@/types';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const MODE_OPTIONS: { value: ModerationMode; label: string; description: string }[] = [
  {
    value: 'automatic',
    label: 'Automatico',
    description: 'Vagas publicadas imediatamente sem revisao',
  },
  {
    value: 'new_companies',
    label: 'Moderacao para novos',
    description: 'Primeiras 3 vagas de cada empresa passam por aprovacao',
  },
  {
    value: 'all',
    label: 'Moderacao total',
    description: 'Toda vaga passa por aprovacao antes de publicar',
  },
  {
    value: 'by_plan',
    label: 'Moderacao por plano',
    description: 'Apenas vagas de empresas do plano Essencial passam por moderacao',
  },
];

export default function ModerationConfig() {
  const { toast } = useToast();
  const {
    config,
    updateConfig,
    addRejectionReason,
    removeRejectionReason,
    toggleAutoFlagRule,
  } = useModeration();

  const [newReason, setNewReason] = useState('');

  const handleAddReason = () => {
    const trimmed = newReason.trim();
    if (trimmed && !config.rejectionReasons.includes(trimmed)) {
      addRejectionReason(trimmed);
      setNewReason('');
      toast({
        title: 'Motivo adicionado',
        description: `"${trimmed}" foi adicionado a lista de motivos.`,
      });
    }
  };

  const handleRemoveReason = (reason: string) => {
    removeRejectionReason(reason);
    toast({
      title: 'Motivo removido',
      description: `"${reason}" foi removido da lista.`,
    });
  };

  const handleSave = () => {
    toast({
      title: 'Configuracoes salvas',
      description: 'As configuracoes de moderacao foram atualizadas com sucesso.',
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <PageHeader
          title="Configurações de Moderação"
          description="Configure o comportamento da moderação de vagas. Defina regras, motivos de rejeição e templates."
          actions={
            <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 shrink-0">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          }
          howItWorks={[
            'Configure regras de moderacao automatica e manual',
            'Defina criterios para aprovacao ou rejeicao de conteudo',
            'Salve as alteracoes para aplicar imediatamente',
          ]}
        />

        <AdminTabNav />

        {/* Moderation mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-600" />
            Modo de Moderacao
          </h2>
          <Separator />

          <RadioGroup
            value={config.mode}
            onValueChange={(v) => updateConfig({ mode: v as ModerationMode })}
          >
            <div className="space-y-3">
              {MODE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    config.mode === option.value
                      ? 'border-cyan-500 bg-cyan-500/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                  onClick={() => updateConfig({ mode: option.value })}
                >
                  <RadioGroupItem value={option.value} id={`mode-${option.value}`} className="mt-0.5" />
                  <div>
                    <Label htmlFor={`mode-${option.value}`} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </motion.div>

        {/* Max pending hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Tempo Maximo de Alerta</h2>
          <Separator />
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={config.maxPendingHours}
              onChange={(e) => updateConfig({ maxPendingHours: Number(e.target.value) || 24 })}
              className="w-24"
              min={1}
            />
            <span className="text-sm text-muted-foreground">
              horas na fila antes de gerar alerta
            </span>
          </div>
        </motion.div>

        {/* Rejection reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Motivos de Rejeicao</h2>
          <Separator />

          <div className="space-y-2">
            {config.rejectionReasons.map((reason) => (
              <div
                key={reason}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <span className="text-sm">{reason}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-500/10"
                  onClick={() => handleRemoveReason(reason)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Novo motivo de rejeicao..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
              className="flex-1"
            />
            <Button onClick={handleAddReason} disabled={!newReason.trim()} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </motion.div>

        {/* Email templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Templates de E-mail</h2>
          <Separator />
          <EmailTemplateEditor
            templates={config.emailTemplates}
            onChange={(key, value) => {
              updateConfig({
                emailTemplates: { ...config.emailTemplates, [key]: value },
              });
            }}
          />
        </motion.div>

        {/* Auto-flagging rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Regras de Auto-Flagging</h2>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Regras automaticas que sinalizam vagas para revisao manual.
          </p>
          <ModerationRulesEditor
            rules={config.autoFlagRules}
            onToggle={toggleAutoFlagRule}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

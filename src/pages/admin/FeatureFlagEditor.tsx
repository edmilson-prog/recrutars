/**
 * FeatureFlagEditor Page
 * PRD-062: Feature Flags "Switch" - Create/Edit Flag
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, ToggleLeft, Skull } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConditionBuilder } from '@/components/admin/flags/ConditionBuilder';
import { RolloutControls } from '@/components/admin/flags/RolloutControls';
import { FlagOverrideManager } from '@/components/admin/flags/FlagOverrideManager';
import { FlagAuditTimeline } from '@/components/admin/flags/FlagAuditTimeline';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';
import type { FeatureFlag, ConditionGroup, FlagStatus } from '@/types';

const categories = [
  { value: 'candidate', label: 'Candidato' },
  { value: 'company', label: 'Empresa' },
  { value: 'beta', label: 'Beta' },
  { value: 'platform', label: 'Plataforma' },
];

const scopes = [
  { value: 'candidate', label: 'Candidato' },
  { value: 'company', label: 'Empresa' },
  { value: 'all', label: 'Todos' },
];

function generateKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

export default function FeatureFlagEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    flags,
    overrides,
    auditLogs,
    updateFlag,
    addOverride,
    removeOverride,
  } = useFeatureFlags();

  const isNew = id === 'new';
  const existingFlag = useMemo(
    () => (isNew ? null : flags.find((f) => f.id === id)),
    [isNew, id, flags]
  );

  // Form state
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('candidate');
  const [scope, setScope] = useState<'candidate' | 'company' | 'all'>('candidate');
  const [status, setStatus] = useState<FlagStatus>('inactive');
  const [defaultValue, setDefaultValue] = useState(false);
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([]);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);
  const [useRollout, setUseRollout] = useState(false);

  // Kill switch state
  const [isKillSwitched, setIsKillSwitched] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (existingFlag) {
      setKey(existingFlag.key);
      setName(existingFlag.name);
      setDescription(existingFlag.description);
      setCategory(existingFlag.category);
      setScope(existingFlag.scope);
      setStatus(existingFlag.status);
      setDefaultValue(existingFlag.defaultValue ?? false);
      setConditionGroups(existingFlag.conditionGroups ?? []);
      setRolloutPercentage(existingFlag.rolloutPercentage ?? 0);
      setUseRollout(existingFlag.rolloutPercentage !== undefined && existingFlag.rolloutPercentage > 0);
      setIsKillSwitched(existingFlag.isKillSwitched ?? false);
      setKillSwitchReason(existingFlag.killSwitchReason || '');
    }
  }, [existingFlag]);

  // Auto-generate key from name
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (isNew) {
      setKey(generateKey(newName));
    }
  };

  // Flag audit logs for this flag
  const flagAudits = useMemo(
    () => (existingFlag ? auditLogs.filter((a) => a.flagKey === existingFlag.key) : []),
    [existingFlag, auditLogs]
  );

  const handleSave = () => {
    if (!key.trim() || !name.trim()) {
      toast.error('Key e nome são obrigatórios.');
      return;
    }

    if (isKillSwitched && !killSwitchReason.trim()) {
      toast.error('Motivo do kill switch é obrigatório.');
      return;
    }

    if (isNew) {
      // For new flags, we add to the list (simplified: in a real app this would be an API call)
      toast.success('Flag criada com sucesso!');
      navigate('/admin/feature-flags');
    } else if (existingFlag) {
      const updates: Partial<FeatureFlag> = {
        key,
        name,
        description,
        category,
        scope,
        status: isKillSwitched ? 'killed' : status,
        defaultValue,
        conditionGroups,
        rolloutPercentage: useRollout ? rolloutPercentage : undefined,
        isKillSwitched,
        killSwitchReason: isKillSwitched ? killSwitchReason : undefined,
        killSwitchedAt: isKillSwitched ? new Date().toISOString() : undefined,
        killSwitchedBy: isKillSwitched ? 'admin-1' : undefined,
      };
      updateFlag(existingFlag.id, updates);
      toast.success('Flag atualizada com sucesso!');
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/feature-flags')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ToggleLeft className="w-8 h-8 text-cyan-600" />
              {isNew ? 'Nova Feature Flag' : `Editar: ${existingFlag?.name || ''}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isNew
                ? 'Configure uma nova flag de funcionalidade'
                : `Key: ${existingFlag?.key || ''}`}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Identifique e categorize a feature flag</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nome</Label>
                      <Input
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Nome da funcionalidade"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Key (slug)</Label>
                      <Input
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="feature_key"
                        className="font-mono text-sm"
                        disabled={!isNew}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Descrição</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva a funcionalidade que esta flag controla..."
                      rows={3}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Categoria</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Escopo</Label>
                      <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {scopes.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={status}
                        onValueChange={(v) => setStatus(v as FlagStatus)}
                        disabled={isKillSwitched}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativa</SelectItem>
                          <SelectItem value="inactive">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Label>Valor padrão</Label>
                    <Switch checked={defaultValue} onCheckedChange={setDefaultValue} />
                    <span className="text-sm text-muted-foreground">
                      {defaultValue ? 'Habilitado' : 'Desabilitado'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Condition Builder */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Condições</CardTitle>
                  <CardDescription>
                    Defina quando a flag deve ser habilitada. Grupos usam lógica OU, condições dentro do grupo usam lógica E.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConditionBuilder
                    conditionGroups={conditionGroups}
                    onChange={setConditionGroups}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Rollout */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Rollout Percentual</CardTitle>
                      <CardDescription>
                        Libere gradualmente a funcionalidade para uma porcentagem dos usuários
                      </CardDescription>
                    </div>
                    <Switch checked={useRollout} onCheckedChange={setUseRollout} />
                  </div>
                </CardHeader>
                {useRollout && (
                  <CardContent>
                    <RolloutControls
                      percentage={rolloutPercentage}
                      onChange={setRolloutPercentage}
                    />
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Kill Switch */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className={isKillSwitched ? 'border-red-300 dark:border-red-800' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skull className={`w-5 h-5 ${isKillSwitched ? 'text-red-600' : 'text-muted-foreground'}`} />
                      <div>
                        <CardTitle>Kill Switch</CardTitle>
                        <CardDescription>
                          Desativa emergencialmente a flag para todos os usuários
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={isKillSwitched}
                      onCheckedChange={setIsKillSwitched}
                    />
                  </div>
                </CardHeader>
                {isKillSwitched && (
                  <CardContent>
                    <div className="space-y-1.5">
                      <Label className="text-red-600">Motivo (obrigatório)</Label>
                      <Textarea
                        value={killSwitchReason}
                        onChange={(e) => setKillSwitchReason(e.target.value)}
                        placeholder="Descreva o motivo do kill switch..."
                        className="border-red-200 dark:border-red-800"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Overrides (edit only) */}
            {!isNew && existingFlag && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <FlagOverrideManager
                  flagKey={existingFlag.key}
                  overrides={overrides}
                  onAdd={addOverride}
                  onRemove={removeOverride}
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="pt-5 space-y-3">
                <Button
                  onClick={handleSave}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isNew ? 'Criar Flag' : 'Salvar Alterações'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/feature-flags')}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>

            {/* Audit Timeline (edit only) */}
            {!isNew && flagAudits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Alterações</CardTitle>
                </CardHeader>
                <CardContent>
                  <FlagAuditTimeline audits={flagAudits} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

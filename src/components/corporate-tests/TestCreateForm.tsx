/**
 * Test Create Form
 * PRD-052: Formulário de criação com react-hook-form + zod
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { DimensionWeightSliders } from './DimensionWeightSliders';
import type { TestTemplate, TargetAudience } from '@/types/companyTest';
import type { GaugeProDimension } from '@/types/gaugePro';
import { cn } from '@/lib/utils';
import { COMPANY_TEST_TEMPLATES } from '@/data/companyTestTemplates';
import { useCreateCompanyTest, useAddTestAuditLog } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';

interface TestCreateFormProps {
  onCreated?: () => void;
}

export function TestCreateForm({ onCreated }: TestCreateFormProps) {
  const { toast } = useToast();
  const { currentCompany, user } = useAuth();
  const createTest = useCreateCompanyTest();
  const addAuditLogMutation = useAddTestAuditLog();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate>(COMPANY_TEST_TEMPLATES[0]);
  const [weights, setWeights] = useState<Record<GaugeProDimension, number>>(COMPANY_TEST_TEMPLATES[0].weights);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('candidate');

  const handleTemplateSelect = (template: TestTemplate) => {
    setSelectedTemplate(template);
    if (!template.isCustom) {
      setWeights({ ...template.weights });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Erro', description: 'Nome do teste é obrigatório.', variant: 'destructive' });
      return;
    }
    if (!currentCompany?.id) {
      toast({ title: 'Erro', description: 'Empresa não identificada.', variant: 'destructive' });
      return;
    }

    try {
      const created = await createTest.mutateAsync({
        companyId: currentCompany.id,
        name,
        templateId: selectedTemplate.id,
        description,
        weights,
        jobTitle: jobTitle || undefined,
        deadline: deadline || undefined,
        instructions: instructions || undefined,
        targetAudience,
        status: 'draft',
      });

      addAuditLogMutation.mutate({
        action: 'test_created',
        userId: user?.id ?? '',
        userName: user?.user_metadata?.full_name ?? '',
        resourceType: 'test',
        resourceId: created.id,
        resourceName: name,
        details: `Template: ${selectedTemplate.name}`,
        companyId: currentCompany.id,
      });

      onCreated?.();
    } catch {
      // Error toast is handled by the mutation's onError
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className={step === 1 ? 'font-bold text-primary' : 'text-muted-foreground'}>
          1. Template
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step === 2 ? 'font-bold text-primary' : 'text-muted-foreground'}>
          2. Pesos
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step === 3 ? 'font-bold text-primary' : 'text-muted-foreground'}>
          3. Detalhes
        </span>
      </div>

      {/* Step 1: Template */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Selecione um Template</h3>
          <TemplateSelector selectedId={selectedTemplate.id} onSelect={handleTemplateSelect} />
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Weights */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Ajustar Pesos por Dimensão
              {!selectedTemplate.isCustom && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Template: {selectedTemplate.name})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DimensionWeightSliders
              weights={weights}
              onChange={setWeights}
              disabled={!selectedTemplate.isCustom}
            />
            {!selectedTemplate.isCustom && (
              <p className="text-xs text-muted-foreground">
                Selecione o template "Personalizado" para ajustar os pesos manualmente.
              </p>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => setStep(3)}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Audience Selector */}
            <div className="space-y-2">
              <Label>Publico-alvo do Teste</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-colors',
                    targetAudience === 'candidate'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30',
                  )}
                  onClick={() => setTargetAudience('candidate')}
                >
                  <div className="font-medium text-sm">Candidatos Externos</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Para processos seletivos e vagas</div>
                </button>
                <button
                  type="button"
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-colors',
                    targetAudience === 'collaborator'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/30',
                  )}
                  onClick={() => setTargetAudience('collaborator')}
                >
                  <div className="font-medium text-sm">Colaboradores da Equipe</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Para mapeamento comportamental interno</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-name">Nome do Teste *</Label>
              <Input
                id="test-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Avaliação Liderança - Gerente de Projetos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-desc">Descrição</Label>
              <Textarea
                id="test-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo do teste..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-job">Vaga (opcional)</Label>
                <Input
                  id="test-job"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Gerente de Projetos Sênior"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-deadline">Prazo (opcional)</Label>
                <Input
                  id="test-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-instructions">Instruções para candidatos</Label>
              <Textarea
                id="test-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instruções que serão exibidas ao candidato antes de iniciar..."
                rows={2}
              />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleSave} disabled={createTest.isPending}>
                {createTest.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar como Rascunho
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

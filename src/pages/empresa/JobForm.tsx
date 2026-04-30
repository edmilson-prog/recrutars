import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, DollarSign, FileText, ListChecks, Gift, Code, Settings, Pause, Play, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useJobForm } from '@/hooks/useJobForm';
import { JobAssistant } from '@/components/empresa/JobAssistant';
import {
  JobFormBasicInfo,
  JobFormSalary,
  JobFormDescription,
  JobFormRequirements,
  JobFormBenefits,
  JobFormSkills,
  JobFormMatchWeights,
} from '@/components/empresa/job-form';
import { JobStatus } from '@/types';

const STATUS_CONFIG: Record<JobStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  active: { label: 'Ativa', variant: 'default', className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400' },
  paused: { label: 'Pausada', variant: 'secondary', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400' },
  closed: { label: 'Encerrada', variant: 'outline', className: 'bg-muted text-muted-foreground' },
};

export default function CompanyJobForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('basic');

  const {
    formData,
    selectedBenefits,
    otherBenefits,
    isEditing,
    notFound,
    isDirty,
    progress,
    jobStatus,
    technicalSkillIds,
    behavioralSkillIds,
    updateFormData,
    setOtherBenefits,
    toggleBenefit,
    handleApplySuggestion,
    handleSaveJob,
    handleUpdateStatus,
    setTechnicalSkillIds,
    setBehavioralSkillIds,
    weights,
    setWeights,
    analysis,
    isAnalyzing,
  } = useJobForm({ jobId: id });

  // Status confirmation dialogs
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Beforeunload protection
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  if (notFound) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Vaga não encontrada.</p>
          <Button onClick={() => navigate('/empresa/vagas')}>Voltar para vagas</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/empresa/vagas')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
                </h1>
                {isEditing && jobStatus && (
                  <Badge variant={STATUS_CONFIG[jobStatus].variant} className={STATUS_CONFIG[jobStatus].className}>
                    {STATUS_CONFIG[jobStatus].label}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {isEditing ? 'Atualize as informações da vaga' : 'Preencha os dados para criar uma nova vaga'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progresso:</span>
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            {isEditing && jobStatus === 'active' && (
              <Button variant="outline" size="sm" onClick={() => setShowPauseDialog(true)}>
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </Button>
            )}
            {isEditing && jobStatus === 'paused' && (
              <Button variant="outline" size="sm" onClick={() => setShowReactivateDialog(true)}>
                <Play className="h-4 w-4 mr-1" />
                Reativar
              </Button>
            )}
            {isEditing && (jobStatus === 'active' || jobStatus === 'paused') && (
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowCloseDialog(true)}>
                <XCircle className="h-4 w-4 mr-1" />
                Encerrar
              </Button>
            )}
            <Button onClick={handleSaveJob} disabled={jobStatus === 'closed'}>
              {isEditing ? 'Salvar Alterações' : 'Publicar Vaga'}
            </Button>
          </div>
        </div>

        {/* Main content: 2/3 form + 1/3 AI assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="basic" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Básico</span>
                </TabsTrigger>
                <TabsTrigger value="salary" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Salário</span>
                </TabsTrigger>
                <TabsTrigger value="description" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Descrição</span>
                </TabsTrigger>
                <TabsTrigger value="requirements" className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">Requisitos</span>
                </TabsTrigger>
                <TabsTrigger value="benefits" className="gap-2">
                  <Gift className="h-4 w-4" />
                  <span className="hidden sm:inline">Benefícios</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-2">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Competências</span>
                </TabsTrigger>
                <TabsTrigger value="match" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Match</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <JobFormBasicInfo formData={formData} onUpdate={updateFormData} />
              </TabsContent>

              <TabsContent value="salary" className="mt-6">
                <JobFormSalary formData={formData} onUpdate={updateFormData} />
              </TabsContent>

              <TabsContent value="description" className="mt-6">
                <JobFormDescription
                  description={formData.description}
                  onUpdate={updateFormData}
                />
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <JobFormRequirements
                  requirements={formData.requirements}
                  onUpdate={updateFormData}
                />
              </TabsContent>

              <TabsContent value="benefits" className="mt-6">
                <JobFormBenefits
                  selectedBenefits={selectedBenefits}
                  otherBenefits={otherBenefits}
                  onToggleBenefit={toggleBenefit}
                  onOtherBenefitsChange={setOtherBenefits}
                />
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <JobFormSkills
                  technicalSkillIds={technicalSkillIds}
                  behavioralSkillIds={behavioralSkillIds}
                  onTechnicalChange={setTechnicalSkillIds}
                  onBehavioralChange={setBehavioralSkillIds}
                />
              </TabsContent>

              <TabsContent value="match" className="mt-6">
                <JobFormMatchWeights weights={weights} onChange={setWeights} />
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => navigate('/empresa/vagas')}>
                Cancelar
              </Button>
              <Button onClick={handleSaveJob} disabled={jobStatus === 'closed'}>
                {isEditing ? 'Salvar Alterações' : 'Publicar Vaga'}
              </Button>
            </div>
          </div>

          {/* AI Assistant sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <JobAssistant
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status confirmation dialogs */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pausar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga não aparecerá para novos candidatos, mas candidaturas existentes serão mantidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateStatus('paused' as JobStatus)}>Pausar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga voltará a aparecer para candidatos e receberá novas candidaturas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateStatus('active' as JobStatus)}>Reativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              A vaga será encerrada permanentemente. Candidaturas existentes serão mantidas para consulta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateStatus('closed' as JobStatus)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

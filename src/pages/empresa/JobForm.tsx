import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, DollarSign, FileText, ListChecks, Gift, Code } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useJobForm } from '@/hooks/useJobForm';
import { JobAssistant } from '@/components/empresa/JobAssistant';
import {
  JobFormBasicInfo,
  JobFormSalary,
  JobFormDescription,
  JobFormRequirements,
  JobFormBenefits,
  JobFormSkills,
} from '@/components/empresa/job-form';

export default function CompanyJobForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('basic');

  const {
    formData,
    selectedBenefits,
    otherBenefits,
    skills,
    newSkill,
    isEditing,
    notFound,
    isDirty,
    progress,
    updateFormData,
    setOtherBenefits,
    setNewSkill,
    toggleBenefit,
    addSkill,
    removeSkill,
    handleSkillKeyPress,
    handleApplySuggestion,
    handleSaveJob,
    analysis,
    isAnalyzing,
  } = useJobForm({ jobId: id });

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
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Atualize as informações da vaga' : 'Preencha os dados para criar uma nova vaga'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progresso:</span>
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Button onClick={handleSaveJob}>
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
                  skills={skills}
                  newSkill={newSkill}
                  onNewSkillChange={setNewSkill}
                  onAddSkill={addSkill}
                  onRemoveSkill={removeSkill}
                  onKeyPress={handleSkillKeyPress}
                />
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => navigate('/empresa/vagas')}>
                Cancelar
              </Button>
              <Button onClick={handleSaveJob}>
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
    </DashboardLayout>
  );
}

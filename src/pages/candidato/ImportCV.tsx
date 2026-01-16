/**
 * ImportCV Page - PRD-038
 * Página de importação e revisão de currículo
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCVParser } from '@/hooks/useCVParser';
import { ParsedCV, ParsedPersonalData, ParsedExperience, ParsedEducation, ParsedSkill } from '@/types/cvParser';

import { CVUploader } from '@/components/candidato/CVUploader';
import { CVParsingProgress } from '@/components/candidato/CVParsingProgress';
import { CVReviewPersonal } from '@/components/candidato/CVReviewPersonal';
import { CVReviewExperiences } from '@/components/candidato/CVReviewExperiences';
import { CVReviewEducation } from '@/components/candidato/CVReviewEducation';
import { CVReviewSkills } from '@/components/candidato/CVReviewSkills';

type PageState = 'upload' | 'parsing' | 'review' | 'success';

export default function ImportCV() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { parsedData, progress, error, isProcessing, parse, reset, updateParsedData } = useCVParser();
  const [pageState, setPageState] = useState<PageState>('upload');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setPageState('parsing');
      await parse(file);
    },
    [parse]
  );

  // Atualizar estado quando o parsing completa
  if (progress?.stage === 'complete' && pageState === 'parsing' && parsedData) {
    setPageState('review');
  }

  // Atualizar estado quando há erro
  if (progress?.stage === 'error' && pageState === 'parsing') {
    setPageState('upload');
  }

  const handlePersonalChange = useCallback(
    (personalData: ParsedPersonalData) => {
      updateParsedData({ personalData });
    },
    [updateParsedData]
  );

  const handleExperiencesChange = useCallback(
    (experiences: ParsedExperience[]) => {
      updateParsedData({ experiences });
    },
    [updateParsedData]
  );

  const handleEducationChange = useCallback(
    (education: ParsedEducation[]) => {
      updateParsedData({ education });
    },
    [updateParsedData]
  );

  const handleSkillsChange = useCallback(
    (skills: ParsedSkill[]) => {
      updateParsedData({ skills });
    },
    [updateParsedData]
  );

  const handleCancel = useCallback(() => {
    reset();
    setPageState('upload');
  }, [reset]);

  const handleSave = useCallback(async () => {
    if (!parsedData) return;

    setIsSaving(true);

    // Simular salvamento (aqui seria a integração com o backend/contexto)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Integrar com o contexto de candidato/perfil para salvar os dados
    // Por enquanto, apenas simula o sucesso

    setIsSaving(false);
    setPageState('success');

    toast({
      title: 'Currículo importado!',
      description: 'Os dados foram salvos no seu perfil.',
    });

    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate('/candidato/perfil');
    }, 2000);
  }, [parsedData, navigate, toast]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleTryAgain = useCallback(() => {
    reset();
    setPageState('upload');
  }, [reset]);

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Importar Currículo
              </h1>
              <p className="text-gray-500">
                Faça upload do seu currículo para pré-preencher seu perfil
              </p>
            </div>
          </div>
        </div>

        {/* Content based on state */}
        {pageState === 'upload' && (
          <UploadState
            onFileSelect={handleFileSelect}
            error={error}
            onTryAgain={handleTryAgain}
          />
        )}

        {pageState === 'parsing' && progress && (
          <ParsingState progress={progress} />
        )}

        {pageState === 'review' && parsedData && (
          <ReviewState
            data={parsedData}
            onPersonalChange={handlePersonalChange}
            onExperiencesChange={handleExperiencesChange}
            onEducationChange={handleEducationChange}
            onSkillsChange={handleSkillsChange}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}

        {pageState === 'success' && <SuccessState />}
      </div>
    </DashboardLayout>
  );
}

// ============ State Components ============

interface UploadStateProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  onTryAgain: () => void;
}

function UploadState({ onFileSelect, error, onTryAgain }: UploadStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Selecione seu currículo
        </h2>
        <p className="text-sm text-gray-500">
          Nosso sistema vai extrair automaticamente suas informações
        </p>
      </div>

      <CVUploader onFileSelect={onFileSelect} />

      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <Button
              variant="link"
              size="sm"
              onClick={onTryAgain}
              className="text-red-600 p-0 h-auto mt-1"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          O que será extraído:
        </h3>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Dados pessoais (nome, email, telefone)</li>
          <li>• Experiências profissionais</li>
          <li>• Formação acadêmica</li>
          <li>• Habilidades técnicas e comportamentais</li>
        </ul>
      </div>
    </div>
  );
}

interface ParsingStateProps {
  progress: NonNullable<ReturnType<typeof useCVParser>['progress']>;
}

function ParsingState({ progress }: ParsingStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="py-8">
        <CVParsingProgress progress={progress} />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700 text-center">
          Analisando o conteúdo do seu currículo...
          <br />
          <span className="text-xs text-blue-600">
            Isso pode levar alguns segundos
          </span>
        </p>
      </div>
    </div>
  );
}

interface ReviewStateProps {
  data: ParsedCV;
  onPersonalChange: (data: ParsedPersonalData) => void;
  onExperiencesChange: (data: ParsedExperience[]) => void;
  onEducationChange: (data: ParsedEducation[]) => void;
  onSkillsChange: (data: ParsedSkill[]) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

function ReviewState({
  data,
  onPersonalChange,
  onExperiencesChange,
  onEducationChange,
  onSkillsChange,
  onCancel,
  onSave,
  isSaving,
}: ReviewStateProps) {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700">
          <strong>Revise os dados extraídos.</strong> Campos com baixa confiança
          estão destacados. Você pode editar qualquer informação antes de salvar.
        </p>
      </div>

      {/* Review sections */}
      <CVReviewPersonal data={data.personalData} onChange={onPersonalChange} />

      <CVReviewExperiences data={data.experiences} onChange={onExperiencesChange} />

      <CVReviewEducation data={data.education} onChange={onEducationChange} />

      <CVReviewSkills data={data.skills} onChange={onSkillsChange} />

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-pulse" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Confirmar e Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Currículo importado com sucesso!
        </h2>
        <p className="text-gray-500">
          Os dados foram salvos no seu perfil.
          <br />
          Redirecionando...
        </p>
      </div>
    </div>
  );
}

/**
 * CVReviewEducation Component - PRD-038
 * Revisão de formação acadêmica extraída do currículo
 */

import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { ParsedEducation } from '@/types/cvParser';
import { CVReviewSection, CVReviewField, ConfidenceIndicator } from './CVReviewSection';
import { getConfidenceLevel } from '@/types/cvParser';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CVReviewEducationProps {
  data: ParsedEducation[];
  onChange: (data: ParsedEducation[]) => void;
}

const DEGREE_OPTIONS = [
  { value: 'Técnico', label: 'Técnico' },
  { value: 'Tecnólogo', label: 'Tecnólogo' },
  { value: 'Bacharelado', label: 'Bacharelado' },
  { value: 'Licenciatura', label: 'Licenciatura' },
  { value: 'Pós-Graduação', label: 'Pós-Graduação' },
  { value: 'MBA', label: 'MBA' },
  { value: 'Mestrado', label: 'Mestrado' },
  { value: 'Doutorado', label: 'Doutorado' },
  { value: 'Outro', label: 'Outro' },
];

export function CVReviewEducation({ data, onChange }: CVReviewEducationProps) {
  const avgConfidence =
    data.length > 0
      ? data.reduce((sum, edu) => sum + edu.confidence, 0) / data.length
      : 0;

  const handleFieldChange = (index: number, field: keyof ParsedEducation) => (value: string) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]: value === '' ? null : value,
    };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([
      ...data,
      {
        id: Math.random().toString(36).substring(2, 11),
        institution: null,
        degree: null,
        field: null,
        startYear: null,
        endYear: null,
        confidence: 0.5,
      },
    ]);
  };

  return (
    <CVReviewSection
      title="Formação Acadêmica"
      description={`${data.length} formação${data.length !== 1 ? 'ões' : ''} detectada${data.length !== 1 ? 's' : ''}`}
      confidence={avgConfidence}
      icon={<GraduationCap className="w-5 h-5 text-gray-500" />}
    >
      <div className="space-y-6">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma formação detectada. Adicione manualmente se necessário.
          </p>
        ) : (
          data.map((education, index) => (
            <EducationCard
              key={education.id}
              education={education}
              index={index}
              onFieldChange={handleFieldChange}
              onRemove={handleRemove}
            />
          ))
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar formação
        </Button>
      </div>
    </CVReviewSection>
  );
}

interface EducationCardProps {
  education: ParsedEducation;
  index: number;
  onFieldChange: (index: number, field: keyof ParsedEducation) => (value: string) => void;
  onRemove: (index: number) => void;
}

function EducationCard({ education, index, onFieldChange, onRemove }: EducationCardProps) {
  const confidenceLevel = getConfidenceLevel(education.confidence);

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border',
        confidenceLevel === 'high' && 'border-green-200 bg-green-50/30',
        confidenceLevel === 'medium' && 'border-yellow-200 bg-yellow-50/30',
        confidenceLevel === 'low' && 'border-red-200 bg-red-50/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Formação {index + 1}
          </span>
          <ConfidenceIndicator level={confidenceLevel} value={education.confidence} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CVReviewField
          label="Instituição"
          value={education.institution}
          onChange={onFieldChange(index, 'institution')}
          placeholder="Nome da instituição"
          className="md:col-span-2"
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Grau</label>
          <Select
            value={education.degree || ''}
            onValueChange={(value) => onFieldChange(index, 'degree')(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o grau" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CVReviewField
          label="Área/Curso"
          value={education.field}
          onChange={onFieldChange(index, 'field')}
          placeholder="ex: Ciência da Computação"
        />

        <CVReviewField
          label="Ano de início"
          value={education.startYear}
          onChange={onFieldChange(index, 'startYear')}
          placeholder="ex: 2018"
        />

        <CVReviewField
          label="Ano de conclusão"
          value={education.endYear}
          onChange={onFieldChange(index, 'endYear')}
          placeholder="ex: 2022"
        />
      </div>
    </div>
  );
}

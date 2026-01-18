/**
 * CVReviewExperiences Component - PRD-038
 * Revisão de experiências profissionais extraídas do currículo
 */

import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { ParsedExperience } from '@/types/cvParser';
import { CVReviewSection, CVReviewField, ConfidenceIndicator } from './CVReviewSection';
import { getConfidenceLevel } from '@/types/cvParser';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CVReviewExperiencesProps {
  data: ParsedExperience[];
  onChange: (data: ParsedExperience[]) => void;
}

export function CVReviewExperiences({ data, onChange }: CVReviewExperiencesProps) {
  const avgConfidence =
    data.length > 0
      ? data.reduce((sum, exp) => sum + exp.confidence, 0) / data.length
      : 0;

  const handleFieldChange = (index: number, field: keyof ParsedExperience) => (value: string | boolean) => {
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
        company: null,
        role: null,
        startDate: null,
        endDate: null,
        isCurrent: false,
        description: null,
        confidence: 0.5,
      },
    ]);
  };

  return (
    <CVReviewSection
      title="Experiência Profissional"
      description={`${data.length} experiência${data.length !== 1 ? 's' : ''} detectada${data.length !== 1 ? 's' : ''}`}
      confidence={avgConfidence}
      icon={<Briefcase className="w-5 h-5 text-gray-500" />}
    >
      <div className="space-y-6">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma experiência detectada. Adicione manualmente se necessário.
          </p>
        ) : (
          data.map((experience, index) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
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
          Adicionar experiência
        </Button>
      </div>
    </CVReviewSection>
  );
}

interface ExperienceCardProps {
  experience: ParsedExperience;
  index: number;
  onFieldChange: (index: number, field: keyof ParsedExperience) => (value: string | boolean) => void;
  onRemove: (index: number) => void;
}

function ExperienceCard({ experience, index, onFieldChange, onRemove }: ExperienceCardProps) {
  const confidenceLevel = getConfidenceLevel(experience.confidence);

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
            Experiência {index + 1}
          </span>
          <ConfidenceIndicator level={confidenceLevel} value={experience.confidence} />
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
          label="Empresa"
          value={experience.company}
          onChange={onFieldChange(index, 'company')}
          placeholder="Nome da empresa"
        />

        <CVReviewField
          label="Cargo"
          value={experience.role}
          onChange={onFieldChange(index, 'role')}
          placeholder="Seu cargo"
        />

        <CVReviewField
          label="Data de início"
          value={experience.startDate}
          onChange={onFieldChange(index, 'startDate')}
          placeholder="ex: jan/2020"
        />

        <div className="space-y-1">
          <CVReviewField
            label="Data de término"
            value={experience.isCurrent ? 'Atual' : experience.endDate}
            onChange={onFieldChange(index, 'endDate')}
            placeholder="ex: dez/2022"
            editable={!experience.isCurrent}
          />
          <div className="flex items-center gap-2 mt-2">
            <Checkbox
              id={`current-${experience.id}`}
              checked={experience.isCurrent}
              onCheckedChange={(checked) =>
                onFieldChange(index, 'isCurrent')(checked as boolean)
              }
            />
            <label
              htmlFor={`current-${experience.id}`}
              className="text-sm text-gray-600 cursor-pointer"
            >
              Trabalho atual
            </label>
          </div>
        </div>

        <CVReviewField
          label="Descrição"
          value={experience.description}
          onChange={onFieldChange(index, 'description')}
          type="textarea"
          placeholder="Descreva suas atividades e conquistas"
          className="md:col-span-2"
        />
      </div>
    </div>
  );
}

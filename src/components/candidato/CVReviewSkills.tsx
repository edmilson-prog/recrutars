/**
 * CVReviewSkills Component - PRD-038
 * Revisão de habilidades extraídas do currículo
 */

import { useState } from 'react';
import { Lightbulb, Plus, X, Check } from 'lucide-react';
import { ParsedSkill, SkillType, getConfidenceLevel } from '@/types/cvParser';
import { CVReviewSection, ConfidenceIndicator } from './CVReviewSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CVReviewSkillsProps {
  data: ParsedSkill[];
  onChange: (data: ParsedSkill[]) => void;
}

const SKILL_TYPE_CONFIG: Record<SkillType, { label: string; color: string }> = {
  technical: { label: 'Técnica', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  behavioral: { label: 'Comportamental', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  tool: { label: 'Ferramenta', color: 'bg-green-100 text-green-700 border-green-200' },
  language: { label: 'Idioma', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export function CVReviewSkills({ data, onChange }: CVReviewSkillsProps) {
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const avgConfidence =
    data.length > 0
      ? data.reduce((sum, skill) => sum + skill.confidence, 0) / data.length
      : 0;

  // Agrupar skills por tipo
  const groupedSkills = data.reduce(
    (acc, skill) => {
      if (!acc[skill.type]) {
        acc[skill.type] = [];
      }
      acc[skill.type].push(skill);
      return acc;
    },
    {} as Record<SkillType, ParsedSkill[]>
  );

  const handleRemove = (skillId: string) => {
    onChange(data.filter((s) => s.id !== skillId));
  };

  const handleAdd = () => {
    if (!newSkill.trim()) return;

    const skill: ParsedSkill = {
      id: Math.random().toString(36).substring(2, 11),
      name: newSkill.trim(),
      normalizedName: newSkill.trim(),
      level: null,
      type: 'technical',
      confidence: 1, // Manual = alta confiança
    };

    onChange([...data, skill]);
    setNewSkill('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewSkill('');
    }
  };

  return (
    <CVReviewSection
      title="Habilidades"
      description={`${data.length} habilidade${data.length !== 1 ? 's' : ''} detectada${data.length !== 1 ? 's' : ''}`}
      confidence={avgConfidence}
      icon={<Lightbulb className="w-5 h-5 text-gray-500" />}
    >
      <div className="space-y-4">
        {data.length === 0 && !isAdding ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma habilidade detectada. Adicione manualmente.
          </p>
        ) : (
          Object.entries(groupedSkills).map(([type, skills]) => (
            <SkillGroup
              key={type}
              type={type as SkillType}
              skills={skills}
              onRemove={handleRemove}
            />
          ))
        )}

        {/* Add skill input */}
        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite a habilidade..."
              className="flex-1"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newSkill.trim()}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewSkill('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar habilidade
          </Button>
        )}
      </div>
    </CVReviewSection>
  );
}

interface SkillGroupProps {
  type: SkillType;
  skills: ParsedSkill[];
  onRemove: (id: string) => void;
}

function SkillGroup({ type, skills, onRemove }: SkillGroupProps) {
  const config = SKILL_TYPE_CONFIG[type];

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {config.label}s
      </span>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge
            key={skill.id}
            skill={skill}
            config={config}
            onRemove={() => onRemove(skill.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SkillBadgeProps {
  skill: ParsedSkill;
  config: { label: string; color: string };
  onRemove: () => void;
}

function SkillBadge({ skill, config, onRemove }: SkillBadgeProps) {
  const confidenceLevel = getConfidenceLevel(skill.confidence);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-3 py-1 text-sm font-normal transition-all cursor-default',
        config.color,
        confidenceLevel === 'low' && 'opacity-70 border-dashed'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{skill.normalizedName}</span>
      {confidenceLevel !== 'high' && (
        <span className="ml-1.5 opacity-60">
          <ConfidenceIndicator level={confidenceLevel} value={skill.confidence} />
        </span>
      )}
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:text-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}

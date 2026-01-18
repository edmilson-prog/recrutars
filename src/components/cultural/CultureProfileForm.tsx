/**
 * Culture Profile Form Component
 * PRD-042: Fit Cultural
 *
 * Form for companies to define their cultural profile
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Plus, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CulturalProfile, CulturalDimension, DimensionValue } from '@/types/culturalFit';
import { DIMENSION_LABELS, DIMENSION_ICONS } from '@/types/culturalFit';
import { culturalDimensions } from '@/data/culturalDimensions';

interface CultureProfileFormProps {
  profile: CulturalProfile;
  values: string[];
  description: string;
  onDimensionChange: (dimension: CulturalDimension, value: DimensionValue) => void;
  onValuesChange: (values: string[]) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onReset: () => void;
  isModified: boolean;
}

const DIMENSIONS: CulturalDimension[] = [
  'innovation',
  'collaboration',
  'hierarchy',
  'pace',
  'direction',
];

export function CultureProfileForm({
  profile,
  values,
  description,
  onDimensionChange,
  onValuesChange,
  onDescriptionChange,
  onSave,
  onReset,
  isModified,
}: CultureProfileFormProps) {
  const [newValue, setNewValue] = useState('');

  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      onValuesChange([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onValuesChange(values.filter(v => v !== valueToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil Cultural</CardTitle>
          <CardDescription>
            Defina as características culturais da sua empresa em cada dimensão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {DIMENSIONS.map(dimension => {
            const dimDef = culturalDimensions.find(d => d.id === dimension);
            if (!dimDef) return null;

            return (
              <DimensionSlider
                key={dimension}
                dimension={dimension}
                value={profile[dimension]}
                definition={dimDef}
                onChange={value => onDimensionChange(dimension, value as DimensionValue)}
              />
            );
          })}
        </CardContent>
      </Card>

      {/* Values */}
      <Card>
        <CardHeader>
          <CardTitle>Valores da Empresa</CardTitle>
          <CardDescription>
            Adicione os valores que definem a cultura da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Inovação, Transparência, Colaboração..."
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddValue();
                }
              }}
            />
            <Button onClick={handleAddValue} disabled={!newValue.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {values.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {values.map(value => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="gap-1 pr-1 text-sm"
                >
                  {value}
                  <button
                    onClick={() => handleRemoveValue(value)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição Cultural</CardTitle>
          <CardDescription>
            Descreva em poucas palavras a cultura da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Somos uma startup tech com cultura ágil e colaborativa, que valoriza inovação e autonomia..."
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {description.length}/500 caracteres
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={!isModified}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Desfazer alterações
        </Button>
        <Button onClick={onSave} disabled={!isModified}>
          <Save className="w-4 h-4 mr-2" />
          Salvar perfil cultural
        </Button>
      </div>
    </div>
  );
}

// Dimension Slider Component
interface DimensionSliderProps {
  dimension: CulturalDimension;
  value: number;
  definition: typeof culturalDimensions[0];
  onChange: (value: number) => void;
}

function DimensionSlider({
  dimension,
  value,
  definition,
  onChange,
}: DimensionSliderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{DIMENSION_ICONS[dimension]}</span>
          <Label className="text-base font-medium">{definition.name}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{definition.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="outline" className="font-mono">
          {value}/5
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-24 text-right">
          {definition.lowLabel}
        </span>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={1}
          max={5}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-24">
          {definition.highLabel}
        </span>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span className="max-w-[45%]">{definition.lowDescription}</span>
        <span className="max-w-[45%] text-right">{definition.highDescription}</span>
      </div>
    </motion.div>
  );
}

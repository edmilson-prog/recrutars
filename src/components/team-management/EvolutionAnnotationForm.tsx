/**
 * EvolutionAnnotationForm
 * PRD-057: Lista de anotacoes de evolucao com formulario inline para adicionar.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap,
  MessageCircle,
  ThumbsUp,
  Award,
  FileText,
  Plus,
  StickyNote,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EvolutionAnnotation } from '@/types/teamManagement';

interface EvolutionAnnotationFormProps {
  annotations: EvolutionAnnotation[];
  onAdd: (data: Omit<EvolutionAnnotation, 'id' | 'createdAt'>) => void;
}

type AnnotationType = EvolutionAnnotation['type'];

const TYPE_CONFIG: Record<
  AnnotationType,
  { label: string; icon: typeof GraduationCap; color: string }
> = {
  training: {
    label: 'Treinamento',
    icon: GraduationCap,
    color: 'text-blue-600 bg-blue-50',
  },
  coaching: {
    label: 'Coaching',
    icon: MessageCircle,
    color: 'text-violet-600 bg-violet-50',
  },
  feedback: {
    label: 'Feedback',
    icon: ThumbsUp,
    color: 'text-green-600 bg-green-50',
  },
  promotion: {
    label: 'Promoção',
    icon: Award,
    color: 'text-amber-600 bg-amber-50',
  },
  other: {
    label: 'Outro',
    icon: FileText,
    color: 'text-gray-600 bg-gray-50',
  },
};

export default function EvolutionAnnotationForm({
  annotations,
  onAdd,
}: EvolutionAnnotationFormProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState<AnnotationType>('training');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAdd = () => {
    if (!text.trim()) return;

    onAdd({
      memberId: '',
      text: text.trim(),
      type,
      date,
    });

    setText('');
    setType('training');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const sortedAnnotations = [...annotations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          Anotações de Evolução
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing annotations list */}
        {sortedAnnotations.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {sortedAnnotations.map((annot) => {
              const cfg = TYPE_CONFIG[annot.type];
              const Icon = cfg.icon;

              return (
                <div
                  key={annot.id}
                  className="flex gap-3 p-3 rounded-lg border bg-card"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full shrink-0',
                      cfg.color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{annot.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(annot.date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma anotação registrada.
          </p>
        )}

        {/* Inline add form */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Nova anotação
          </p>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descreva o evento ou observação..."
          />
          <div className="flex items-center gap-2">
            <Select
              value={type}
              onValueChange={(v) => setType(v as AnnotationType)}
            >
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_CONFIG) as AnnotationType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_CONFIG[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px] h-9 text-xs"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!text.trim()}
              className="gap-1 h-9"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

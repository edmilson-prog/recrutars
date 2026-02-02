import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DESCRIPTION_LIMIT } from '@/hooks/useJobForm';

interface JobFormDescriptionProps {
  description: string;
  onUpdate: (updates: { description: string }) => void;
}

export function JobFormDescription({ description, onUpdate }: JobFormDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Descrição da Vaga</CardTitle>
        <CardDescription>Descreva as responsabilidades e atividades do cargo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          placeholder="Descreva as responsabilidades e atividades do cargo..."
          className="min-h-[200px]"
          maxLength={DESCRIPTION_LIMIT}
          value={description}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
        <div className="text-right text-sm text-muted-foreground">
          {description.length}/{DESCRIPTION_LIMIT}
        </div>
      </CardContent>
    </Card>
  );
}

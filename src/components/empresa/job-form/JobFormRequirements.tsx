import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { REQUIREMENTS_LIMIT } from '@/hooks/useJobForm';

interface JobFormRequirementsProps {
  requirements: string;
  onUpdate: (updates: { requirements: string }) => void;
}

export function JobFormRequirements({ requirements, onUpdate }: JobFormRequirementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos</CardTitle>
        <CardDescription>Liste os requisitos e qualificações necessárias (um por linha)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="requirements">Requisitos *</Label>
        <Textarea
          id="requirements"
          placeholder={"5+ anos de experiência\nConhecimento em React\nInglês avançado"}
          className="min-h-[180px]"
          maxLength={REQUIREMENTS_LIMIT}
          value={requirements}
          onChange={(e) => onUpdate({ requirements: e.target.value })}
        />
        <div className="text-right text-sm text-muted-foreground">
          {requirements.length}/{REQUIREMENTS_LIMIT}
        </div>
      </CardContent>
    </Card>
  );
}

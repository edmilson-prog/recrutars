import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StandardizedSkillSelector } from '@/components/skills/StandardizedSkillSelector';
import { useSkillCatalog } from '@/hooks/useStandardizedSkillsQuery';
import { Loader2 } from 'lucide-react';

interface JobFormSkillsProps {
  technicalSkillIds: string[];
  behavioralSkillIds: string[];
  onTechnicalChange: (ids: string[]) => void;
  onBehavioralChange: (ids: string[]) => void;
}

export function JobFormSkills({
  technicalSkillIds,
  behavioralSkillIds,
  onTechnicalChange,
  onBehavioralChange,
}: JobFormSkillsProps) {
  const { data: catalog, isLoading } = useSkillCatalog();

  if (isLoading || !catalog) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando competências...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competências Desejadas</CardTitle>
        <CardDescription>
          Selecione até 5 competências técnicas e 5 comportamentais para esta vaga.
          A ordem de seleção define a prioridade no match com candidatos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StandardizedSkillSelector
          type="technical"
          selectedSkillIds={technicalSkillIds}
          onChange={onTechnicalChange}
          maxSelections={5}
          catalog={catalog}
        />
        <Separator />
        <StandardizedSkillSelector
          type="behavioral"
          selectedSkillIds={behavioralSkillIds}
          onChange={onBehavioralChange}
          maxSelections={5}
          catalog={catalog}
        />
      </CardContent>
    </Card>
  );
}

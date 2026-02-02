import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { COMMON_BENEFITS } from '@/hooks/useJobForm';

interface JobFormBenefitsProps {
  selectedBenefits: string[];
  otherBenefits: string;
  onToggleBenefit: (benefit: string) => void;
  onOtherBenefitsChange: (value: string) => void;
}

export function JobFormBenefits({
  selectedBenefits,
  otherBenefits,
  onToggleBenefit,
  onOtherBenefitsChange,
}: JobFormBenefitsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefícios</CardTitle>
        <CardDescription>Selecione os benefícios oferecidos pela empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMMON_BENEFITS.map(benefit => (
            <div key={benefit} className="flex items-center gap-2">
              <Checkbox
                id={`benefit-${benefit}`}
                checked={selectedBenefits.includes(benefit)}
                onCheckedChange={() => onToggleBenefit(benefit)}
              />
              <Label htmlFor={`benefit-${benefit}`} className="text-sm cursor-pointer">
                {benefit}
              </Label>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label>Outros benefícios</Label>
          <Textarea
            placeholder={"Horário flexível\nAmbiente descontraído\nCursos gratuitos"}
            className="min-h-[80px]"
            value={otherBenefits}
            onChange={(e) => onOtherBenefitsChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

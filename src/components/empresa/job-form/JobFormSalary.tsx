import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface JobFormSalaryProps {
  formData: {
    salaryNegotiable: boolean;
    salaryMin: string;
    salaryMax: string;
  };
  onUpdate: (updates: Partial<JobFormSalaryProps['formData']>) => void;
}

export function JobFormSalary({ formData, onUpdate }: JobFormSalaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Remuneração</CardTitle>
        <CardDescription>Faixa salarial oferecida para esta vaga</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="salaryNegotiable"
            checked={formData.salaryNegotiable}
            onCheckedChange={(checked) => onUpdate({ salaryNegotiable: checked as boolean })}
          />
          <Label htmlFor="salaryNegotiable" className="cursor-pointer">
            Salário a combinar
          </Label>
        </div>
        {!formData.salaryNegotiable && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salário mínimo (R$)</Label>
              <Input
                id="salaryMin"
                type="number"
                placeholder="8000"
                value={formData.salaryMin}
                onChange={(e) => onUpdate({ salaryMin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salário máximo (R$)</Label>
              <Input
                id="salaryMax"
                type="number"
                placeholder="12000"
                value={formData.salaryMax}
                onChange={(e) => onUpdate({ salaryMax: e.target.value })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

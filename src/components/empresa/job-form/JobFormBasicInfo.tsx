import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EyeOff } from 'lucide-react';
import { brazilianCitiesByState } from '@/data/brazilianCities';

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

const SORTED_STATES = Object.keys(brazilianCitiesByState).sort((a, b) =>
  STATE_NAMES[a].localeCompare(STATE_NAMES[b], 'pt-BR'),
);

interface JobFormBasicInfoProps {
  formData: {
    title: string;
    area: string;
    type: '' | 'remote' | 'hybrid' | 'onsite';
    state: string;
    city: string;
    level: string;
    positionsCount: string;
    isAnonymous: boolean;
  };
  onUpdate: (updates: Partial<JobFormBasicInfoProps['formData']>) => void;
}

export function JobFormBasicInfo({ formData, onUpdate }: JobFormBasicInfoProps) {
  const isRemote = formData.type === 'remote';
  const locationRequired = !isRemote;

  // Cidades filtradas pela UF selecionada
  const cities = useMemo(() => {
    if (!formData.state) return [];
    return brazilianCitiesByState[formData.state] ?? [];
  }, [formData.state]);

  const handleStateChange = (newState: string) => {
    // Trocar estado limpa cidade — evita combinações inválidas
    if (newState !== formData.state) {
      onUpdate({ state: newState, city: '' });
    } else {
      onUpdate({ state: newState });
    }
  };

  const handleTypeChange = (newType: 'remote' | 'hybrid' | 'onsite') => {
    // Mudar para remoto não apaga cidade/estado (escritório matriz pode ser informado);
    // mudar para presencial/híbrido também preserva.
    onUpdate({ type: newType });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
        <CardDescription>Dados principais da vaga</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2 space-y-2">
            <Label htmlFor="title">Título da vaga *</Label>
            <Input
              id="title"
              placeholder="Ex: Analista Financeiro, Vendedor Externo..."
              value={formData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Contrato *</Label>
            <Select value={formData.area} onValueChange={(v) => onUpdate({ area: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Estágio">Estágio</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Modalidade *</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remoto</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
                <SelectItem value="onsite">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">
              Estado {locationRequired ? '*' : <span className="text-muted-foreground font-normal">(opcional)</span>}
            </Label>
            <Select value={formData.state} onValueChange={handleStateChange}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {SORTED_STATES.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {STATE_NAMES[uf]} ({uf})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">
              Cidade {locationRequired ? '*' : <span className="text-muted-foreground font-normal">(opcional)</span>}
            </Label>
            <Select
              value={formData.city}
              onValueChange={(v) => onUpdate({ city: v })}
              disabled={!formData.state}
            >
              <SelectTrigger id="city">
                <SelectValue
                  placeholder={formData.state ? 'Selecione a cidade' : 'Escolha o estado primeiro'}
                />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nível</Label>
            <Select value={formData.level} onValueChange={(v) => onUpdate({ level: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Estágio">Estágio</SelectItem>
                <SelectItem value="Junior">Júnior</SelectItem>
                <SelectItem value="Pleno">Pleno</SelectItem>
                <SelectItem value="Senior">Sênior</SelectItem>
                <SelectItem value="Especialista">Especialista</SelectItem>
                <SelectItem value="Gerente">Gerente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="positionsCount">Numero de vagas</Label>
            <Input
              id="positionsCount"
              type="number"
              min={1}
              value={formData.positionsCount}
              onChange={(e) => onUpdate({ positionsCount: e.target.value })}
              placeholder="1"
            />
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isAnonymous" className="flex items-center gap-2 cursor-pointer">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                Empresa confidencial
              </Label>
              <p className="text-sm text-muted-foreground">
                O nome e logo da empresa não serão exibidos aos candidatos
              </p>
            </div>
            <Switch
              id="isAnonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => onUpdate({ isAnonymous: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

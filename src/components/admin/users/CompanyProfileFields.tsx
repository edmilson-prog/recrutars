/**
 * CompanyProfileFields
 * Sub-component for admin "Create User" form — company-specific profile fields.
 * All fields are optional. CNPJ lookup auto-fills address and company data.
 */

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { maskCNPJInput, isValidCNPJ, lookupCNPJ } from '@/lib/cnpj';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ── Types ──

export interface CompanyProfileData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
  industry: string;
  size: string;
  website: string;
  linkedin: string;
}

interface CompanyProfileFieldsProps {
  value: CompanyProfileData;
  onChange: (data: CompanyProfileData) => void;
}

// ── Constants ──

const SIZE_OPTIONS = [
  { value: 'MEI', label: 'MEI' },
  { value: 'ME', label: 'Microempresa' },
  { value: 'EPP', label: 'Empresa de Pequeno Porte' },
  { value: 'Medio', label: 'Medio Porte' },
  { value: 'Grande', label: 'Grande Porte' },
];

// ── Helper ──

function OptionalSuffix() {
  return <span className="text-muted-foreground font-normal">(opcional)</span>;
}

// ── Component ──

export function CompanyProfileFields({ value, onChange }: CompanyProfileFieldsProps) {
  const { toast } = useToast();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Update a single field in the profile data
  const updateField = (field: keyof CompanyProfileData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  // Check if CNPJ has 14 digits (valid length for lookup)
  const cnpjDigits = value.cnpj.replace(/\D/g, '');
  const canLookup = cnpjDigits.length === 14 && !isLookingUp;

  const handleCnpjChange = (inputValue: string) => {
    const masked = maskCNPJInput(inputValue);
    updateField('cnpj', masked);

    // Reset auto-filled state when CNPJ changes
    if (autoFilled) {
      setAutoFilled(false);
    }
  };

  const handleLookup = async () => {
    if (!isValidCNPJ(value.cnpj)) {
      toast({
        title: 'CNPJ invalido',
        description: 'Verifique os digitos informados.',
        variant: 'destructive',
      });
      return;
    }

    setIsLookingUp(true);
    try {
      const result = await lookupCNPJ(value.cnpj);

      if (result.success) {
        const { data } = result;
        onChange({
          ...value,
          razaoSocial: data.razaoSocial || '',
          nomeFantasia: data.nomeFantasia || '',
          cep: data.cep || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          city: data.city || '',
          state: data.state || '',
          industry: data.industry || '',
          size: data.size || data.porte || '',
        });
        setAutoFilled(true);
      } else {
        toast({
          title: 'Erro ao consultar CNPJ',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro ao consultar CNPJ',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Row 1: CNPJ + Consultar */}
      <div className="space-y-1.5">
        <Label htmlFor="company-cnpj">
          CNPJ <OptionalSuffix />
        </Label>
        <div className="flex gap-2">
          <Input
            id="company-cnpj"
            placeholder="00.000.000/0000-00"
            value={value.cnpj}
            onChange={(e) => handleCnpjChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canLookup}
            onClick={handleLookup}
            className="shrink-0 h-10 px-3"
          >
            {isLookingUp ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-1.5" />
            )}
            Consultar
          </Button>
        </div>
      </div>

      {/* Row 2: Razao Social | Nome Fantasia */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="company-razao-social">
            Razao Social <OptionalSuffix />
          </Label>
          <Input
            id="company-razao-social"
            placeholder="Razao social da empresa"
            value={value.razaoSocial}
            onChange={(e) => updateField('razaoSocial', e.target.value)}
            readOnly={autoFilled}
            className={cn(autoFilled && 'bg-muted/50')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-nome-fantasia">
            Nome Fantasia <OptionalSuffix />
          </Label>
          <Input
            id="company-nome-fantasia"
            placeholder="Nome fantasia"
            value={value.nomeFantasia}
            onChange={(e) => updateField('nomeFantasia', e.target.value)}
          />
        </div>
      </div>

      {/* Row 3: CEP | Logradouro */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-cep">
            CEP <OptionalSuffix />
          </Label>
          <Input
            id="company-cep"
            placeholder="00000-000"
            value={value.cep}
            onChange={(e) => updateField('cep', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-logradouro">
            Logradouro <OptionalSuffix />
          </Label>
          <Input
            id="company-logradouro"
            placeholder="Rua, avenida, etc."
            value={value.logradouro}
            onChange={(e) => updateField('logradouro', e.target.value)}
          />
        </div>
      </div>

      {/* Row 4: Numero | Complemento | Bairro */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-numero">
            Numero <OptionalSuffix />
          </Label>
          <Input
            id="company-numero"
            placeholder="123"
            value={value.numero}
            onChange={(e) => updateField('numero', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-complemento">
            Complemento <OptionalSuffix />
          </Label>
          <Input
            id="company-complemento"
            placeholder="Sala, andar, etc."
            value={value.complemento}
            onChange={(e) => updateField('complemento', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-bairro">
            Bairro <OptionalSuffix />
          </Label>
          <Input
            id="company-bairro"
            placeholder="Bairro"
            value={value.bairro}
            onChange={(e) => updateField('bairro', e.target.value)}
          />
        </div>
      </div>

      {/* Row 5: Cidade | Estado */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-city">
            Cidade <OptionalSuffix />
          </Label>
          <Input
            id="company-city"
            placeholder="Cidade"
            value={value.city}
            onChange={(e) => updateField('city', e.target.value)}
            readOnly={autoFilled}
            className={cn(autoFilled && 'bg-muted/50')}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-state">
            Estado <OptionalSuffix />
          </Label>
          <Input
            id="company-state"
            placeholder="UF"
            value={value.state}
            onChange={(e) => updateField('state', e.target.value)}
            readOnly={autoFilled}
            className={cn(autoFilled && 'bg-muted/50')}
          />
        </div>
      </div>

      {/* Row 6: Setor/Industria | Porte */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-industry">
            Setor/Industria <OptionalSuffix />
          </Label>
          <Input
            id="company-industry"
            placeholder="Ex: Tecnologia, Saude, Varejo"
            value={value.industry}
            onChange={(e) => updateField('industry', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-size">
            Porte <OptionalSuffix />
          </Label>
          <Select
            value={value.size}
            onValueChange={(selectedValue) => updateField('size', selectedValue)}
          >
            <SelectTrigger id="company-size">
              <SelectValue placeholder="Selecione o porte" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 7: Website | LinkedIn */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-website">
            Website <OptionalSuffix />
          </Label>
          <Input
            id="company-website"
            type="url"
            placeholder="https://www.exemplo.com.br"
            value={value.website}
            onChange={(e) => updateField('website', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company-linkedin">
            LinkedIn <OptionalSuffix />
          </Label>
          <Input
            id="company-linkedin"
            type="url"
            placeholder="https://linkedin.com/company/..."
            value={value.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * CandidateProfileFields
 * Sub-component for admin "Create User" form — candidate-specific profile fields.
 * All fields are optional.
 */

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { brazilianCitiesByState } from '@/data/brazilianCities';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CandidateProfileData {
  cpf: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: string;
  maritalStatus: string;
  nationality: string;
  state: string;
  city: string;
}

interface CandidateProfileFieldsProps {
  value: CandidateProfileData;
  onChange: (data: CandidateProfileData) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
  { value: 'outro', label: 'Outro' },
];

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

const STATES = Object.keys(brazilianCitiesByState).sort();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Apply progressive CPF mask: XXX.XXX.XXX-XX */
function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CandidateProfileFields({ value, onChange }: CandidateProfileFieldsProps) {
  // Memoize the filtered cities list so it only recalculates when state changes
  const cities = useMemo(() => {
    if (!value.state) return [];
    return brazilianCitiesByState[value.state] ?? [];
  }, [value.state]);

  // Helper to update a single field in the data object
  const updateField = (field: keyof CandidateProfileData, fieldValue: string) => {
    const updated = { ...value, [field]: fieldValue };

    // Clear city when state changes
    if (field === 'state' && fieldValue !== value.state) {
      updated.city = '';
    }

    onChange(updated);
  };

  // Reusable label suffix for optional fields
  const optionalSuffix = (
    <span className="text-muted-foreground font-normal">(opcional)</span>
  );

  return (
    <div className="space-y-4">
      {/* Row 1: CPF | Data de Nascimento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">
            CPF {optionalSuffix}
          </Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={value.cpf}
            onChange={(e) => updateField('cpf', maskCPF(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Data de Nascimento {optionalSuffix}
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={value.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
          />
        </div>
      </div>

      {/* Row 2: Genero | Estado Civil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">
            Gênero {optionalSuffix}
          </Label>
          <Select
            value={value.gender}
            onValueChange={(v) => updateField('gender', v)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">
            Estado Civil {optionalSuffix}
          </Label>
          <Select
            value={value.maritalStatus}
            onValueChange={(v) => updateField('maritalStatus', v)}
          >
            <SelectTrigger id="maritalStatus">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Nacionalidade */}
      <div className="space-y-2">
        <Label htmlFor="nationality">
          Nacionalidade {optionalSuffix}
        </Label>
        <Input
          id="nationality"
          placeholder="Brasileira"
          value={value.nationality}
          onChange={(e) => updateField('nationality', e.target.value)}
        />
      </div>

      {/* Row 4: Estado | Cidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">
            Estado {optionalSuffix}
          </Label>
          <Select
            value={value.state}
            onValueChange={(v) => updateField('state', v)}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {STATE_NAMES[uf] ?? uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            Cidade {optionalSuffix}
          </Label>
          <Select
            value={value.city}
            onValueChange={(v) => updateField('city', v)}
            disabled={!value.state}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder={value.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'} />
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
      </div>
    </div>
  );
}

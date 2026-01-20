/**
 * ConfigImageUpload Component
 * PRD-045: Campo de upload de imagem
 */

import { useRef } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ConfigField } from '@/types/settings';

interface ConfigImageUploadProps {
  field: ConfigField;
  value: string;
  onChange: (value: string) => void;
}

export function ConfigImageUpload({
  field,
  value,
  onChange,
}: ConfigImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo muito grande. Maximo 2MB.');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Apenas arquivos de imagem sao permitidos.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{field.name}</Label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={field.key}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {value ? 'Alterar' : 'Enviar'}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

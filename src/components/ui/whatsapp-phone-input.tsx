/**
 * WhatsAppPhoneInput
 *
 * Composite phone input with country code selector, Brazilian mask formatting,
 * and optional WhatsApp number validation via Evolution API.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCheckWhatsAppNumbers } from '@/hooks/useWhatsAppQuery';
import {
  stripToDigits,
  formatBrazilianPhone,
  isPhoneComplete,
  getNationalDigits,
  buildFullNumber,
} from '@/hooks/usePhoneMask';

// ---------------------------------------------------------------------------
// Country data
// ---------------------------------------------------------------------------

const COUNTRIES = [
  { code: '55', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brasil' },
  { code: '54', flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentina' },
  { code: '598', flag: '\u{1F1FA}\u{1F1FE}', name: 'Uruguai' },
  { code: '595', flag: '\u{1F1F5}\u{1F1FE}', name: 'Paraguai' },
  { code: '56', flag: '\u{1F1E8}\u{1F1F1}', name: 'Chile' },
  { code: '57', flag: '\u{1F1E8}\u{1F1F4}', name: 'Col\u00f4mbia' },
  { code: '51', flag: '\u{1F1F5}\u{1F1EA}', name: 'Peru' },
  { code: '52', flag: '\u{1F1F2}\u{1F1FD}', name: 'M\u00e9xico' },
  { code: '1', flag: '\u{1F1FA}\u{1F1F8}', name: 'Estados Unidos' },
  { code: '351', flag: '\u{1F1F5}\u{1F1F9}', name: 'Portugal' },
] as const;

type CountryCode = (typeof COUNTRIES)[number]['code'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WhatsAppPhoneInputProps {
  /** HTML id for the inner input element */
  id?: string;
  /** Full raw digits including country code (e.g. "5554981522759") */
  value: string;
  /** Emits full raw digits including country code */
  onChange: (value: string) => void;
  /** Show a "Verificar WhatsApp" button below the input */
  showValidateButton?: boolean;
  /** Validate on blur / debounce automatically */
  autoValidate?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /** External error message */
  error?: string;
  /** Extra classes on the wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

/** Detect if raw digits start with a known country code and return it */
function detectCountryCode(digits: string): CountryCode | null {
  // Check longer codes first (3-digit) to avoid false matches
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const country of sorted) {
    if (digits.startsWith(country.code)) {
      return country.code;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WhatsAppPhoneInput({
  id,
  value,
  onChange,
  showValidateButton = false,
  autoValidate = false,
  disabled = false,
  error,
  className,
}: WhatsAppPhoneInputProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>(() => {
    // Initialize country code from value if possible
    if (value) {
      const detected = detectCountryCode(value);
      if (detected) return detected;
    }
    return '55';
  });

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkMutation = useCheckWhatsAppNumbers();

  // Derive national digits from value
  const nationalDigits = getNationalDigits(value, countryCode);

  // Format for display (only Brazilian formatting for now)
  const displayValue =
    countryCode === '55'
      ? formatBrazilianPhone(nationalDigits)
      : nationalDigits;

  // Current country object
  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ------ Validation ------

  const runValidation = useCallback(
    async (fullNumber: string) => {
      if (!isPhoneComplete(fullNumber, countryCode)) return;
      setValidationStatus('validating');
      try {
        const results = await checkMutation.mutateAsync([fullNumber]);
        const match = results?.find((r) => r.number === fullNumber || r.exists);
        setValidationStatus(match?.exists ? 'valid' : 'invalid');
      } catch {
        setValidationStatus('invalid');
      }
    },
    [countryCode, checkMutation],
  );

  const scheduleValidation = useCallback(
    (fullNumber: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runValidation(fullNumber);
      }, 1500);
    },
    [runValidation],
  );

  // ------ Handlers ------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = stripToDigits(e.target.value);
      // Limit national digits: 11 for BR, 15 generic
      const maxLen = countryCode === '55' ? 11 : 15;
      const limited = raw.slice(0, maxLen);
      const fullNumber = buildFullNumber(limited, countryCode);
      onChange(fullNumber);

      // Reset validation on any keystroke
      setValidationStatus('idle');

      // Auto-validate with debounce
      if (autoValidate && isPhoneComplete(fullNumber, countryCode)) {
        scheduleValidation(fullNumber);
      }
    },
    [countryCode, onChange, autoValidate, scheduleValidation],
  );

  const handleBlur = useCallback(() => {
    if (autoValidate && isPhoneComplete(value, countryCode) && validationStatus === 'idle') {
      runValidation(value);
    }
  }, [autoValidate, value, countryCode, validationStatus, runValidation]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = stripToDigits(e.clipboardData.getData('text'));
      if (!pasted) return;

      // Detect country code from pasted number
      const detected = detectCountryCode(pasted);
      if (detected) {
        setCountryCode(detected);
        const national = pasted.slice(detected.length);
        const maxLen = detected === '55' ? 11 : 15;
        onChange(buildFullNumber(national.slice(0, maxLen), detected));
      } else {
        const maxLen = countryCode === '55' ? 11 : 15;
        onChange(buildFullNumber(pasted.slice(0, maxLen), countryCode));
      }

      setValidationStatus('idle');
    },
    [countryCode, onChange],
  );

  const handleCountrySelect = useCallback(
    (code: CountryCode) => {
      setCountryCode(code);
      setPopoverOpen(false);
      // Re-emit with new country code, keeping national digits
      const national = getNationalDigits(value, countryCode);
      onChange(buildFullNumber(national, code));
      setValidationStatus('idle');
      // Focus the input after selecting
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [value, countryCode, onChange],
  );

  const handleManualValidate = useCallback(() => {
    if (isPhoneComplete(value, countryCode)) {
      runValidation(value);
    }
  }, [value, countryCode, runValidation]);

  // ------ Placeholder ------

  const placeholder =
    countryCode === '55' ? '(54) 98152-2759' : 'Numero nacional';

  // ------ Validation indicator ------

  const validationIndicator = (() => {
    switch (validationStatus) {
      case 'validating':
        return (
          <Loader2
            className="w-4 h-4 animate-spin text-muted-foreground"
            aria-label="Verificando numero"
          />
        );
      case 'valid':
        return (
          <CheckCircle2
            className="w-4 h-4 text-emerald-500"
            aria-label="Numero valido no WhatsApp"
          />
        );
      case 'invalid':
        return (
          <XCircle
            className="w-4 h-4 text-red-500"
            aria-label="Numero nao encontrado no WhatsApp"
          />
        );
      default:
        return null;
    }
  })();

  return (
    <div className={cn('space-y-2', className)}>
      {/* Main input row */}
      <div
        className={cn(
          'flex items-center rounded-md border bg-background transition-colors',
          error
            ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/30'
            : 'border-input focus-within:ring-2 focus-within:ring-ring',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Country code selector */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Pais selecionado: ${selectedCountry.name} +${selectedCountry.code}. Clique para alterar.`}
              className={cn(
                'flex items-center gap-1.5 px-3 h-10 shrink-0 border-r border-input rounded-l-md text-sm font-mono',
                'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                'transition-colors disabled:pointer-events-none',
              )}
            >
              <span aria-hidden="true">{selectedCountry.flag}</span>
              <span>+{selectedCountry.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-56 p-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <ScrollArea className="max-h-60">
              <div role="listbox" aria-label="Selecionar pais">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={country.code === countryCode}
                    onClick={() => handleCountrySelect(country.code)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm text-sm transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:bg-muted',
                      country.code === countryCode && 'bg-muted font-medium',
                    )}
                  >
                    <span aria-hidden="true" className="text-base">{country.flag}</span>
                    <span className="flex-1 text-left text-foreground">{country.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">+{country.code}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Phone input */}
        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
          aria-invalid={!!error || validationStatus === 'invalid'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'flex-1 h-10 bg-transparent px-3 text-sm font-mono',
            'placeholder:text-muted-foreground',
            'focus:outline-none',
            'disabled:cursor-not-allowed',
          )}
        />

        {/* Validation status indicator */}
        {validationIndicator && (
          <div className="flex items-center px-2 shrink-0" aria-live="polite">
            {validationIndicator}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Optional validate button */}
      {showValidateButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={
            disabled ||
            !isPhoneComplete(value, countryCode) ||
            validationStatus === 'validating'
          }
          onClick={handleManualValidate}
          className="text-xs"
        >
          {validationStatus === 'validating' ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : null}
          Verificar WhatsApp
        </Button>
      )}
    </div>
  );
}

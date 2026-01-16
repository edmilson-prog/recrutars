/**
 * useCVParser Hook - PRD-038
 * Hook para gerenciar o parsing de currículos
 */

import { useState, useCallback } from 'react';
import { ParsedCV, CVParserProgress } from '@/types/cvParser';
import { parseCV } from '@/lib/cvParser';

interface UseCVParserReturn {
  parsedData: ParsedCV | null;
  progress: CVParserProgress | null;
  error: string | null;
  isProcessing: boolean;
  parse: (file: File) => Promise<void>;
  reset: () => void;
  updateParsedData: (data: Partial<ParsedCV>) => void;
}

export function useCVParser(): UseCVParserReturn {
  const [parsedData, setParsedData] = useState<ParsedCV | null>(null);
  const [progress, setProgress] = useState<CVParserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parse = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setParsedData(null);
    setProgress({ stage: 'idle', progress: 0, message: 'Iniciando...' });

    try {
      const result = await parseCV(file, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setParsedData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar o currículo';
      setError(errorMessage);
      setProgress({ stage: 'error', progress: 0, message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setParsedData(null);
    setProgress(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  const updateParsedData = useCallback((data: Partial<ParsedCV>) => {
    setParsedData((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  return {
    parsedData,
    progress,
    error,
    isProcessing,
    parse,
    reset,
    updateParsedData,
  };
}

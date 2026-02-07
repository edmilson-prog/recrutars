/**
 * AI Analysis Section
 * PRD-053: Seção expansível de análise IA
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { renderAnalysisContent } from '@/lib/renderAnalysisContent';

interface AIAnalysisSectionProps {
  analysis: string;
  defaultExpanded?: boolean;
}

export function AIAnalysisSection({ analysis, defaultExpanded = false }: AIAnalysisSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Análise Inteligente
            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200">
              Gerado por IA
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {renderAnalysisContent(analysis)}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

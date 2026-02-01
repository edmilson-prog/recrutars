/**
 * Shortlist Card
 * PRD-053: Card de candidato na shortlist
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Star, StarOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FitScoreDisplay } from './FitScoreDisplay';
import { GaugeProRadarChart } from './GaugeProRadarChart';
import type { CompanyTestResult } from '@/types/companyTest';

interface ShortlistCardProps {
  result: CompanyTestResult;
  rank: number;
  onRemove: (id: string) => void;
}

export function ShortlistCard({ result, rank, onRemove }: ShortlistCardProps) {
  const navigate = useNavigate();
  const initials = result.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <Card className={rank === 1 ? 'ring-1 ring-amber-300' : ''}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
            #{rank}
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">{result.candidateName}</p>
              {rank === 1 && (
                <Badge className="bg-amber-100 text-amber-700 text-[10px]">Recomendado</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{result.archetype.name}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <GaugeProRadarChart scores={result.scores} size="sm" />
        </div>

        {result.fitScore !== undefined && result.fitClassification && (
          <FitScoreDisplay score={result.fitScore} classification={result.fitClassification} compact />
        )}

        {result.shortlistNotes && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
            {result.shortlistNotes}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => navigate(`/empresa/testes/${result.testId}/resultado/${result.candidateId}`)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver Resultado
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive"
            onClick={() => onRemove(result.id)}
          >
            <StarOff className="h-3 w-3 mr-1" />
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

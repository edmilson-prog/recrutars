/**
 * MatchTabs — Wrapper que envelopa o match algorítmico existente em tabs,
 * adicionando uma segunda tab "Análise IA".
 *
 * IMPORTANTE: NÃO duplica nem altera o MatchBreakdown — ele é passado como children
 * para a primeira tab, mantendo 100% do comportamento atual.
 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Sparkles } from 'lucide-react';
import { AIMatchTab } from './AIMatchTab';
import type { Candidate } from '@/types/candidate';
import type { Job } from '@/types/job';
import type { MatchResult } from '@/types/disc';

interface MatchTabsProps {
  candidate: Candidate;
  job: Job;
  matchResult: MatchResult;
  behavioralAnalysisExisting?: string | null;
  /** O bloco completo do match algorítmico atual (MatchBreakdown + componentes adjacentes) */
  algorithmicChildren: React.ReactNode;
}

export function MatchTabs({
  candidate,
  job,
  matchResult,
  behavioralAnalysisExisting,
  algorithmicChildren,
}: MatchTabsProps) {
  return (
    <Tabs defaultValue="algorithmic" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="algorithmic" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Match Algorítmico
        </TabsTrigger>
        <TabsTrigger value="ai" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Análise IA
        </TabsTrigger>
      </TabsList>

      <TabsContent value="algorithmic" className="mt-4">
        {algorithmicChildren}
      </TabsContent>

      <TabsContent value="ai" className="mt-4">
        <AIMatchTab
          candidate={candidate}
          job={job}
          matchResult={matchResult}
          behavioralAnalysisExisting={behavioralAnalysisExisting}
        />
      </TabsContent>
    </Tabs>
  );
}

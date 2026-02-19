/**
 * Shortlist Panel
 * PRD-053: Shortlist automática (Top 3) + manual
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { ShortlistCard } from './ShortlistCard';
import { useToast } from '@/hooks/use-toast';
import { useUpdateShortlist, useAddTestAuditLog } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyTestResult } from '@/types/companyTest';

interface ShortlistPanelProps {
  results: CompanyTestResult[];
  testId: string;
}

export function ShortlistPanel({ results, testId }: ShortlistPanelProps) {
  const { toast } = useToast();
  const { currentCompany, user } = useAuth();
  const updateShortlist = useUpdateShortlist();
  const addAuditLogMutation = useAddTestAuditLog();
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(() => {
    const auto = new Set<string>();
    [...results]
      .filter(r => r.fitScore !== undefined)
      .sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0))
      .slice(0, 3)
      .forEach(r => auto.add(r.id));
    // Also add manually shortlisted
    results.filter(r => r.shortlisted).forEach(r => auto.add(r.id));
    return auto;
  });

  const shortlisted = results
    .filter(r => shortlistedIds.has(r.id))
    .sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));

  const handleRemove = (id: string) => {
    const result = results.find(r => r.id === id);
    setShortlistedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (result) {
      updateShortlist.mutate({ resultId: id, shortlisted: false, testId });
      addAuditLogMutation.mutate({
        action: 'shortlist_removed',
        userId: user?.id ?? '',
        userName: user?.user_metadata?.full_name ?? '',
        resourceType: 'result',
        resourceId: id,
        resourceName: result.candidateName,
        companyId: currentCompany?.id ?? '',
      });
      toast({ title: 'Removido da shortlist', description: `${result.candidateName} removido.` });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Star className="h-4 w-4 text-amber-500" />
          Shortlist
          <Badge variant="secondary" className="text-xs">{shortlisted.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shortlisted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum candidato na shortlist.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortlisted.map((r, i) => (
              <ShortlistCard key={r.id} result={r} rank={i + 1} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

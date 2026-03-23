/**
 * Invite Panel
 * PRD-052: Painel de convites (3 modos) — Supabase-backed
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Link2, Users, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmailInviteForm } from './EmailInviteForm';
import { PublicLinkManager } from './PublicLinkManager';
import { InternalCandidateInvite } from './InternalCandidateInvite';
import { useCompanyTests, useTestInvitations } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';

export function InvitePanel() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;

  const { data: tests, isLoading: testsLoading } = useCompanyTests(companyId, { status: 'active' });
  const activeTests = tests ?? [];

  const [selectedTestId, setSelectedTestId] = useState('');
  const [expirationOverride, setExpirationOverride] = useState<number | null>(null);
  const [showExpirationSelect, setShowExpirationSelect] = useState(false);

  // Auto-select first test when data loads
  const effectiveTestId = selectedTestId || activeTests[0]?.id || '';
  const selectedTest = activeTests.find(t => t.id === effectiveTestId);

  const testDefault = selectedTest?.defaultExpirationDays ?? 30;
  const effectiveExpiration = expirationOverride ?? testDefault;
  const isOverridden = expirationOverride !== null;

  // Reset override when test changes
  useEffect(() => {
    setExpirationOverride(null);
    setShowExpirationSelect(false);
  }, [effectiveTestId]);

  const { data: invitations, isLoading: invitationsLoading } = useTestInvitations(
    effectiveTestId || undefined
  );

  const stats = {
    total: invitations?.length ?? 0,
    sent: invitations?.filter(i => i.status === 'sent').length ?? 0,
    started: invitations?.filter(i => i.status === 'started').length ?? 0,
    completed: invitations?.filter(i => i.status === 'completed').length ?? 0,
    expired: invitations?.filter(i => i.status === 'expired').length ?? 0,
  };

  if (testsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Teste ativo</label>
        <Select value={effectiveTestId} onValueChange={setSelectedTestId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Selecione um teste" />
          </SelectTrigger>
          <SelectContent>
            {activeTests.map(test => (
              <SelectItem key={test.id} value={test.id}>
                {test.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTest ? (
        <p className="text-sm text-muted-foreground">Nenhum teste ativo disponível.</p>
      ) : (
        <>
          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            {invitationsLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <>
                <Badge variant="outline">Total: {stats.total}</Badge>
                <Badge variant="secondary">Pendentes: {stats.sent}</Badge>
                <Badge className="bg-blue-100 text-blue-700">Em andamento: {stats.started}</Badge>
                <Badge className="bg-green-100 text-green-700">Concluídos: {stats.completed}</Badge>
                {stats.expired > 0 && (
                  <Badge variant="destructive">Expirados: {stats.expired}</Badge>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={isOverridden ? 'border-primary/50 text-primary' : 'text-muted-foreground'}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Validade: {effectiveExpiration} dias{isOverridden ? ' (personalizado)' : ''}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isOverridden
                          ? `Override ativo: ${effectiveExpiration} dias (padrão do teste: ${testDefault} dias)`
                          : `Convites enviados para este teste expiram em ${testDefault} dias`
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>

          {/* Expiration Override */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {showExpirationSelect ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Validade dos convites</span>
                <Select
                  value={String(expirationOverride ?? testDefault)}
                  onValueChange={(v) => setExpirationOverride(Number(v) === testDefault ? null : Number(v))}
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia (24h)</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  Padrão do teste: {testDefault} dias.
                </span>
                {isOverridden && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => { setExpirationOverride(null); setShowExpirationSelect(false); }}
                  >
                    Restaurar padrão
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Validade dos convites: {effectiveExpiration} dias{!isOverridden ? ' (padrão do teste)' : ''}
                </span>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowExpirationSelect(true)}
                >
                  Alterar
                </button>
              </div>
            )}
          </div>

          {/* Invite Methods */}
          {(() => {
            const isCollaborator = selectedTest.targetAudience === 'collaborator';
            return (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isCollaborator ? 'Convidar Colaboradores' : 'Convidar Candidatos'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={isCollaborator ? 'internal' : 'email'}>
                    <TabsList className={`grid w-full ${isCollaborator ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {!isCollaborator && (
                        <TabsTrigger value="email" className="text-xs">
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          Por Email
                        </TabsTrigger>
                      )}
                      {!isCollaborator && (
                        <TabsTrigger value="link" className="text-xs">
                          <Link2 className="h-3.5 w-3.5 mr-1.5" />
                          Link Público
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="internal" className="text-xs">
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        {isCollaborator ? 'Da Equipe' : 'Da Base'}
                      </TabsTrigger>
                      {isCollaborator && (
                        <TabsTrigger value="email" className="text-xs">
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          Por Email
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="email" className="mt-4">
                      <EmailInviteForm testId={effectiveTestId} testName={selectedTest.name} defaultExpirationDays={effectiveExpiration} />
                    </TabsContent>
                    {!isCollaborator && (
                      <TabsContent value="link" className="mt-4">
                        <PublicLinkManager
                          testId={effectiveTestId}
                          testName={selectedTest.name}
                          existingSlug={selectedTest.publicLinkSlug}
                          isActive={selectedTest.publicLinkActive}
                        />
                      </TabsContent>
                    )}
                    <TabsContent value="internal" className="mt-4">
                      <InternalCandidateInvite
                        testId={effectiveTestId}
                        testName={selectedTest.name}
                        targetAudience={selectedTest.targetAudience}
                        defaultExpirationDays={effectiveExpiration}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })()}
        </>
      )}
    </div>
  );
}

/**
 * Invite Panel
 * PRD-052: Painel de convites (3 modos)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Link2, Users } from 'lucide-react';
import { EmailInviteForm } from './EmailInviteForm';
import { PublicLinkManager } from './PublicLinkManager';
import { InternalCandidateInvite } from './InternalCandidateInvite';
// TODO: PRD-072 — migrate to service layer
import { mockCompanyTests, mockTestInvitations } from '@/data/companyTestData';

export function InvitePanel() {
  const activeTests = mockCompanyTests.filter(t => t.status === 'active');
  const [selectedTestId, setSelectedTestId] = useState(activeTests[0]?.id || '');
  const selectedTest = mockCompanyTests.find(t => t.id === selectedTestId);

  const invitations = mockTestInvitations.filter(i => i.testId === selectedTestId);
  const stats = {
    total: invitations.length,
    sent: invitations.filter(i => i.status === 'sent').length,
    started: invitations.filter(i => i.status === 'started').length,
    completed: invitations.filter(i => i.status === 'completed').length,
    expired: invitations.filter(i => i.status === 'expired').length,
  };

  return (
    <div className="space-y-6">
      {/* Test Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Teste ativo</label>
        <Select value={selectedTestId} onValueChange={setSelectedTestId}>
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
            <Badge variant="outline">Total: {stats.total}</Badge>
            <Badge variant="secondary">Pendentes: {stats.sent}</Badge>
            <Badge className="bg-blue-100 text-blue-700">Em andamento: {stats.started}</Badge>
            <Badge className="bg-green-100 text-green-700">Concluídos: {stats.completed}</Badge>
            {stats.expired > 0 && (
              <Badge variant="destructive">Expirados: {stats.expired}</Badge>
            )}
          </div>

          {/* Invite Methods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Convidar Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email" className="text-xs">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Por Email
                  </TabsTrigger>
                  <TabsTrigger value="link" className="text-xs">
                    <Link2 className="h-3.5 w-3.5 mr-1.5" />
                    Link Público
                  </TabsTrigger>
                  <TabsTrigger value="internal" className="text-xs">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Da Base
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-4">
                  <EmailInviteForm testId={selectedTestId} testName={selectedTest.name} />
                </TabsContent>
                <TabsContent value="link" className="mt-4">
                  <PublicLinkManager
                    testId={selectedTestId}
                    testName={selectedTest.name}
                    existingSlug={selectedTest.publicLinkSlug}
                    isActive={selectedTest.publicLinkActive}
                  />
                </TabsContent>
                <TabsContent value="internal" className="mt-4">
                  <InternalCandidateInvite testId={selectedTestId} testName={selectedTest.name} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

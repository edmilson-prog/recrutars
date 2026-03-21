/**
 * Invite Panel Container
 * Wrapper com sub-abas: "Enviar" (fluxo atual) + "Gerenciar" (gestão de convites)
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, ClipboardList } from 'lucide-react';
import { InvitePanel } from './InvitePanel';
import { InvitationManager } from './InvitationManager';

export function InvitePanelContainer() {
  const [activeSubTab, setActiveSubTab] = useState('send');

  return (
    <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="send" className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          Enviar
        </TabsTrigger>
        <TabsTrigger value="manage" className="gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" />
          Gerenciar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="send">
        <InvitePanel />
      </TabsContent>

      <TabsContent value="manage">
        <InvitationManager />
      </TabsContent>
    </Tabs>
  );
}

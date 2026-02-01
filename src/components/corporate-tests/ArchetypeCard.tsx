/**
 * Archetype Card
 * PRD-053: Card do perfil arquetipal
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, MessageSquare } from 'lucide-react';
import type { ArchetypeProfile } from '@/types/gaugePro';

interface ArchetypeCardProps {
  archetype: ArchetypeProfile;
}

export function ArchetypeCard({ archetype }: ArchetypeCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {archetype.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{archetype.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Estilo de Trabalho
          </div>
          <p className="text-sm text-muted-foreground pl-6">{archetype.workStyle}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Estilo de Comunicação
          </div>
          <p className="text-sm text-muted-foreground pl-6">{archetype.communicationStyle}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Papéis Ideais</p>
          <div className="flex flex-wrap gap-1">
            {archetype.idealRoles.map(role => (
              <Badge key={role} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

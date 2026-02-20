/**
 * RequesterQuickActions Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Quick action links (view profile, suggest upgrade, etc.).
 */

import { ExternalLink, CreditCard, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RequesterContext } from '@/types/help';

interface RequesterQuickActionsProps {
  context: RequesterContext;
}

export function RequesterQuickActions({ context }: RequesterQuickActionsProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (context.userType === 'company' && context.companyId) {
      navigate(`/admin/empresas/${context.companyId}`);
    } else if (context.userType === 'candidate') {
      navigate(`/admin/candidatos/${context.userId}`);
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {(context.userType === 'company' || context.userType === 'candidate') && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs gap-2 h-8"
            onClick={handleViewProfile}
          >
            <User className="h-3.5 w-3.5" />
            Ver perfil completo
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        )}
        {context.userType === 'company' && context.isTrial && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs gap-2 h-8"
            onClick={() => navigate('/admin/planos')}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Sugerir upgrade de plano
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

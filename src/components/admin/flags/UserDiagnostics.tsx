/**
 * UserDiagnostics Component
 * PRD-062: Feature Flags "Switch"
 *
 * User-level diagnostics showing evaluation chain for each flag.
 */

import { useState } from 'react';
import { User, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EvaluationChain } from './EvaluationChain';
import type { FeatureFlag, FeatureFlagOverride, EvaluationContext, EvaluationResult } from '@/types';

interface UserDiagnosticsProps {
  userId: string;
  flags: FeatureFlag[];
  overrides: FeatureFlagOverride[];
  evaluate: (key: string, context: EvaluationContext) => EvaluationResult;
}

const mockUsers = [
  { id: 'candidate-1', name: 'Joao Santos', type: 'candidate', plan: 'essencial' },
  { id: 'candidate-2', name: 'Maria Oliveira', type: 'candidate', plan: 'avancar' },
  { id: 'candidate-4', name: 'Carla Mendes', type: 'candidate', plan: 'destaque-maximo' },
  { id: 'candidate-5', name: 'Lucas Ferreira', type: 'candidate', plan: 'essencial' },
  { id: 'company-1', name: 'Tech Solutions', type: 'company', plan: 'recrutamento-premium' },
  { id: 'company-2', name: 'Inovacao Digital', type: 'company', plan: 'selecao-inteligente' },
  { id: 'company-3', name: 'StartUp Brasil', type: 'company', plan: 'essencial-empresas' },
];

export function UserDiagnostics({ userId: initialUserId, flags, overrides, evaluate }: UserDiagnosticsProps) {
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || mockUsers[0].id);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId) || mockUsers[0];

  const context: EvaluationContext = {
    userId: selectedUser.id,
    userType: selectedUser.type as 'admin' | 'company' | 'candidate',
    planSlug: selectedUser.plan,
    roleSlug: 'viewer',
    capabilities: [],
    companyId: selectedUser.type === 'company' ? selectedUser.id : undefined,
  };

  const userOverrides = overrides.filter(
    (o) => o.targetId === selectedUser.id
  );

  const results = flags.map((flag) => ({
    flag,
    result: evaluate(flag.key, context),
    hasOverride: userOverrides.some((o) => o.flagKey === flag.key),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-600" />
          Diagnostico por Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.type} - {u.plan})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userOverrides.length > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {userOverrides.length} override(s)
            </Badge>
          )}
        </div>

        {/* Flags evaluation list */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {results.map(({ flag, result, hasOverride }) => (
            <div key={flag.key} className="border rounded-lg">
              <button
                onClick={() => setExpandedFlag(expandedFlag === flag.key ? null : flag.key)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedFlag === flag.key ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <span className="text-sm font-medium">{flag.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{flag.key}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasOverride && (
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Override
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      result.enabled
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    )}
                  >
                    {result.enabled ? 'Habilitada' : 'Desabilitada'}
                  </Badge>
                </div>
              </button>

              {expandedFlag === flag.key && (
                <div className="px-4 pb-4 pt-1 border-t bg-muted/20">
                  <EvaluationChain result={result} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

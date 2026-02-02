/**
 * ScenarioManager
 * PRD-056: Save/load Team Builder scenarios dialog.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, FolderOpen, Trash2, Calendar, Users, Layers } from 'lucide-react';
import type { TeamBuilderScenario } from '@/types/teamManagement';

interface ScenarioManagerProps {
  scenarios: TeamBuilderScenario[];
  currentTeams: Array<{ id: string; name: string; memberIds: string[] }>;
  onSave: (name: string, description?: string) => void;
  onLoad: (scenario: TeamBuilderScenario) => void;
  onDelete: (scenarioId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ScenarioManager({
  scenarios,
  currentTeams,
  onSave,
  onLoad,
  onDelete,
  open,
  onOpenChange,
}: ScenarioManagerProps) {
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [activeTab, setActiveTab] = useState('save');

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim(), saveDescription.trim() || undefined);
    setSaveName('');
    setSaveDescription('');
    onOpenChange(false);
  };

  const totalMembersInTeams = currentTeams.reduce(
    (sum, t) => sum + t.memberIds.length,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Cenarios</DialogTitle>
          <DialogDescription>
            Salve ou carregue cenarios de composicao de equipes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="save" className="flex-1 gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Salvar
            </TabsTrigger>
            <TabsTrigger value="load" className="flex-1 gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Carregar
            </TabsTrigger>
          </TabsList>

          {/* Save tab */}
          <TabsContent value="save" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Nome do cenario
                </label>
                <Input
                  placeholder="Ex: Reorganizacao Q1 2026"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Descricao (opcional)
                </label>
                <Textarea
                  placeholder="Descreva o objetivo deste cenario..."
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Current state preview */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="text-xs font-medium">Estado atual:</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {currentTeams.length} time(s)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {totalMembersInTeams} membro(s)
                </span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Cenario
            </Button>
          </TabsContent>

          {/* Load tab */}
          <TabsContent value="load" className="mt-4">
            {scenarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhum cenario salvo</p>
                <p className="text-xs mt-1">
                  Salve um cenario na aba &ldquo;Salvar&rdquo;
                </p>
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto pr-1">
                <div className="space-y-2">
                  {scenarios.map((scenario) => {
                    const totalMembers = scenario.teams.reduce(
                      (sum, t) => sum + t.memberIds.length,
                      0,
                    );

                    return (
                      <div
                        key={scenario.id}
                        className="p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {scenario.name}
                            </p>
                            {scenario.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {scenario.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(scenario.updatedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                {scenario.teams.length} time(s)
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {totalMembers} membro(s)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              onLoad(scenario);
                              onOpenChange(false);
                            }}
                          >
                            <FolderOpen className="h-3 w-3 mr-1" />
                            Carregar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(scenario.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

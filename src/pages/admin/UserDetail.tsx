/**
 * Admin User Detail Page
 * PRD-061: Detalhe do usuario com abas de dados, permissoes, timeline, assinatura e notas
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, User, Shield, Clock, CreditCard, StickyNote,
  Plus, Trash2, Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUser } from '@/hooks/useUsersQuery';
import { useRoles, useAuditLogs, usePermissionGroups } from '@/hooks/useRBACQuery';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionsTab } from '@/components/admin/users/PermissionsTab';
import type { UserStatus, AuditAction } from '@/types/rbac';

const typeOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'company', label: 'Empresa' },
  { value: 'candidate', label: 'Candidato' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'pending', label: 'Pendente' },
];

const auditActionLabels: Record<string, string> = {
  role_assigned: 'Papel Atribuido',
  role_removed: 'Papel Removido',
  permission_granted: 'Permissao Concedida',
  permission_denied: 'Permissao Negada',
  permission_removed: 'Permissao Removida',
  group_created: 'Grupo Criado',
  group_updated: 'Grupo Atualizado',
  group_deleted: 'Grupo Excluido',
  group_member_added: 'Membro Adicionado',
  group_member_removed: 'Membro Removido',
  user_created: 'Usuario Criado',
  user_updated: 'Usuario Atualizado',
  user_status_changed: 'Status Alterado',
  user_deleted: 'Usuario Excluido',
  impersonation_started: 'Impersonacao Iniciada',
  impersonation_ended: 'Impersonacao Encerrada',
  login: 'Login',
  logout: 'Logout',
  password_changed: 'Senha Alterada',
  plan_changed: 'Plano Alterado',
};

const auditActionColors: Record<string, string> = {
  login: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  user_created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  user_updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  user_status_changed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  user_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  role_assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  role_removed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  permission_granted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  permission_denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  plan_changed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  impersonation_started: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  impersonation_ended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  password_changed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  group_created: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_updated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_member_added: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  group_member_removed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

interface AdminNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: originalUser, isLoading: isLoadingUser } = useUser(id || '');
  const { data: rolesData } = useRoles();
  const { data: auditLogsData } = useAuditLogs();
  const { data: groupsData } = usePermissionGroups();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<string>('candidate');
  const [status, setStatus] = useState<UserStatus>('active');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<AdminNote[]>([
    {
      id: 'note-1',
      text: 'Usuario verificado manualmente apos solicitacao via suporte.',
      createdBy: 'Ana Silva',
      createdAt: '2026-01-15T10:00:00Z',
    },
  ]);
  const [formInitialized, setFormInitialized] = useState(false);

  // Hydrate form when user data loads
  useMemo(() => {
    if (originalUser && !formInitialized) {
      setName(originalUser.name || '');
      setEmail(originalUser.email || '');
      setType(originalUser.type || 'candidate');
      setStatus((originalUser.status as UserStatus) || 'active');
      setFormInitialized(true);
    }
  }, [originalUser, formInitialized]);

  // Timeline: filter audit logs for this user
  const userTimeline = useMemo(() => {
    if (!auditLogsData) return [];
    return auditLogsData
      .filter(log => log.targetUserId === id || log.performedBy === id)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
      .slice(0, 50);
  }, [auditLogsData, id]);

  if (isLoadingUser) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!originalUser) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">Usuario nao encontrado.</p>
          <Link to="/admin/usuarios" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Usuarios
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (n: string) =>
    n.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [
      {
        id: `note-${Date.now()}`,
        text: noteText.trim(),
        createdBy: 'Ana Silva',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNoteText('');
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handlePermissionsSave = (updates: { roleId?: string; groupIds?: string[] }) => {
    // Mock save - in real app would call API
    console.log('Saving permissions:', updates);
  };

  // Mock plan data
  const planHistory = [
    { plan: 'Essencial', startDate: '2024-03-10', endDate: '2024-09-10', status: 'expired' },
    { plan: 'Profissional', startDate: '2024-09-10', endDate: null, status: 'active' },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Breadcrumb + Back */}
        <div className="flex items-center gap-4">
          <Link to="/admin/usuarios">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(originalUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{originalUser.name}</h1>
                <p className="text-sm text-muted-foreground">{originalUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dados">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="dados" className="gap-1.5">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="permissoes" className="gap-1.5">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Permissoes</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Assinatura</span>
            </TabsTrigger>
            <TabsTrigger value="notas" className="gap-1.5">
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">Notas</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados Tab */}
          <TabsContent value="dados">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-soft space-y-6"
            >
              <h2 className="text-lg font-semibold">Dados do Usuario</h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID</span>
                  <p className="font-mono text-foreground">{originalUser.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cadastro</span>
                  <p className="text-foreground">
                    {new Date(originalUser.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ultimo Acesso</span>
                  <p className="text-foreground">
                    {originalUser.lastAccessAt
                      ? formatRelativeDate(originalUser.lastAccessAt)
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alteracoes
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Permissoes Tab */}
          <TabsContent value="permissoes">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-soft"
            >
              <PermissionsTab user={originalUser} onSave={handlePermissionsSave} />
            </motion.div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-soft space-y-4"
            >
              <h2 className="text-lg font-semibold">Timeline de Atividades</h2>
              <p className="text-sm text-muted-foreground">
                Ultimos {userTimeline.length} eventos registrados para este usuario.
              </p>

              {userTimeline.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento encontrado.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                  <div className="space-y-4">
                    {userTimeline.map((event) => {
                      const colorClass = auditActionColors[event.action] || 'bg-gray-100 text-gray-800';
                      return (
                        <div key={event.id} className="flex gap-4 relative">
                          {/* Dot */}
                          <div className="w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center z-10 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-4">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Badge variant="outline" className={cn('text-xs border-0', colorClass)}>
                                {auditActionLabels[event.action] || event.action}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeDate(event.performedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{event.details}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Por: {event.performedByName}
                              {event.oldValue && event.newValue && (
                                <span className="ml-2">
                                  ({event.oldValue} → {event.newValue})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Assinatura Tab */}
          <TabsContent value="assinatura">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-soft space-y-6"
            >
              <h2 className="text-lg font-semibold">Assinatura e Plano</h2>

              {/* Current Plan */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plano Atual</p>
                    <p className="text-lg font-semibold text-foreground">
                      {originalUser.type === 'admin' ? 'N/A (Admin)' : 'Profissional'}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                    Ativo
                  </Badge>
                </div>
                {originalUser.type !== 'admin' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Ativo desde 10/09/2024
                  </p>
                )}
              </div>

              {/* History */}
              {originalUser.type !== 'admin' && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Historico de Planos</h3>
                  <div className="space-y-2">
                    {planHistory.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <span className="text-sm font-medium">{entry.plan}</span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.startDate).toLocaleDateString('pt-BR')}
                            {entry.endDate ? ` - ${new Date(entry.endDate).toLocaleDateString('pt-BR')}` : ' - Atual'}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs border-0',
                            entry.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                          )}
                        >
                          {entry.status === 'active' ? 'Ativo' : 'Expirado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Notas Tab */}
          <TabsContent value="notas">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 shadow-soft space-y-6"
            >
              <h2 className="text-lg font-semibold">Notas Internas</h2>
              <p className="text-sm text-muted-foreground">
                Notas visiveis apenas para administradores.
              </p>

              {/* Add note */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Escreva uma nota sobre este usuario..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Nota
                </Button>
              </div>

              <Separator />

              {/* Notes list */}
              {notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma nota registrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="p-4 border rounded-lg bg-muted/30 group">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{note.createdBy}</span>
                        <span>-</span>
                        <span>{formatRelativeDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

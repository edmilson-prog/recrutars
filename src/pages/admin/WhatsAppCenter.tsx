/**
 * WhatsAppCenter
 * Main admin page for WhatsApp messaging management.
 * Sub-tabs: Mensagens (messages + stats), Campanhas (campaigns), Templates.
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  MessageCircle,
  CheckCheck,
  XCircle,
  Users,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Phone,
  Inbox,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { WhatsAppPhoneInput } from '@/components/ui/whatsapp-phone-input';
import { WhatsAppStatusBadge } from '@/components/admin/notifications/WhatsAppStatusBadge';
import { WhatsAppTemplateEditor } from '@/components/admin/notifications/WhatsAppTemplateEditor';
import { BulkCampaignWizard } from '@/components/admin/notifications/BulkCampaignWizard';
import {
  useWhatsAppMessages,
  useWhatsAppMessageStats,
  useWhatsAppTemplates,
  useSendWhatsAppMessage,
  useCreateWhatsAppTemplate,
  useUpdateWhatsAppTemplate,
  useDeleteWhatsAppTemplate,
} from '@/hooks/useWhatsAppQuery';
import type {
  WhatsAppTemplate,
  WhatsAppMessage,
  CreateWhatsAppTemplateParams,
} from '@/types/whatsapp';
import {
  whatsAppCategoryLabels,
  whatsAppCategoryColors,
} from '@/types/whatsapp';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubTab = 'mensagens' | 'campanhas' | 'templates';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateBR(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** KPI stat cards for the Mensagens sub-tab */
function WhatsAppStatsCards({ stats }: { stats: { total: number; sent: number; failed: number; campaigns: number } }) {
  const kpis = [
    {
      key: 'total',
      label: 'Total Enviadas',
      value: stats.total,
      icon: MessageCircle,
      color: 'bg-primary/10 text-primary',
    },
    {
      key: 'sent',
      label: 'Entregues',
      value: stats.sent,
      icon: CheckCheck,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    {
      key: 'failed',
      label: 'Falhas',
      value: stats.failed,
      icon: XCircle,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    {
      key: 'campaigns',
      label: 'Campanhas',
      value: stats.campaigns,
      icon: Users,
      color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="bg-card rounded-xl p-4 shadow-soft">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                kpi.color,
              )}
            >
              <kpi.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Simple dialog for sending an individual message */
function SendMessageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const sendMutation = useSendWhatsAppMessage();

  const handleClose = () => {
    if (sendMutation.isPending) return;
    onOpenChange(false);
  };

  const handleSend = async () => {
    if (!phone.trim() || !text.trim()) return;
    try {
      const result = await sendMutation.mutateAsync({ phone: phone.trim(), text: text.trim() });
      if (result?.success) {
        setPhone('');
        setText('');
        onOpenChange(false);
      }
    } catch {
      // Error handled by mutation onError — keep dialog open
    }
  };

  // Reset on close
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setPhone('');
      setText('');
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Nova Mensagem WhatsApp
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem individual via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="msg-phone">Telefone</Label>
            <WhatsAppPhoneInput
              id="msg-phone"
              value={phone}
              onChange={setPhone}
              autoValidate
              showValidateButton
              disabled={sendMutation.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="msg-text">Mensagem</Label>
            <Textarea
              id="msg-text"
              placeholder="Digite a mensagem..."
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={sendMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={!phone.trim() || !text.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {sendMutation.isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WhatsAppCenter() {
  const navigate = useNavigate();

  // Sub-tab state
  const [activeTab, setActiveTab] = useState<SubTab>('mensagens');

  // Dialog states
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | undefined>();
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState<WhatsAppTemplate | null>(null);

  // Data hooks
  const { data: stats = { total: 0, sent: 0, failed: 0, campaigns: 0 } } = useWhatsAppMessageStats();
  const { data: messages = [] } = useWhatsAppMessages();
  const { data: templates = [] } = useWhatsAppTemplates();

  // Mutations
  const createTemplateMutation = useCreateWhatsAppTemplate();
  const updateTemplateMutation = useUpdateWhatsAppTemplate();
  const deleteTemplateMutation = useDeleteWhatsAppTemplate();

  // ------- Template handlers -------

  const handleCreateTemplate = useCallback(() => {
    setEditingTemplate(undefined);
    setTemplateEditorOpen(true);
  }, []);

  const handleEditTemplate = useCallback((template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setTemplateEditorOpen(true);
  }, []);

  const handleSaveTemplate = useCallback(async (params: CreateWhatsAppTemplateParams) => {
    if (editingTemplate) {
      await updateTemplateMutation.mutateAsync({ id: editingTemplate.id, data: params });
    } else {
      await createTemplateMutation.mutateAsync(params);
    }
    setTemplateEditorOpen(false);
    setEditingTemplate(undefined);
  }, [editingTemplate, updateTemplateMutation, createTemplateMutation]);

  const handleToggleTemplate = useCallback(async (template: WhatsAppTemplate) => {
    await updateTemplateMutation.mutateAsync({
      id: template.id,
      data: { isActive: !template.isActive },
    });
  }, [updateTemplateMutation]);

  const handleDeleteTemplate = useCallback(async () => {
    if (!deleteConfirmTemplate) return;
    await deleteTemplateMutation.mutateAsync(deleteConfirmTemplate.id);
    setDeleteConfirmTemplate(null);
  }, [deleteConfirmTemplate, deleteTemplateMutation]);

  // ------- Grouped campaigns -------

  const campaigns = useMemo(() => {
    const grouped = new Map<string, WhatsAppMessage[]>();
    for (const msg of messages as WhatsAppMessage[]) {
      if (msg.campaignId) {
        const existing = grouped.get(msg.campaignId) ?? [];
        existing.push(msg);
        grouped.set(msg.campaignId, existing);
      }
    }
    return Array.from(grouped.entries())
      .map(([campaignId, msgs]) => {
        const sent = msgs.filter((m) => m.status === 'sent').length;
        const failed = msgs.filter((m) => m.status === 'failed').length;
        const firstMsg = msgs[0];
        const template = (templates as WhatsAppTemplate[]).find((t) => t.id === firstMsg?.templateId);
        return {
          campaignId,
          date: firstMsg?.createdAt ?? '',
          totalMessages: msgs.length,
          sent,
          failed,
          templateName: template?.name ?? 'Texto livre',
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [messages, templates]);

  // ------- Sorted messages -------

  const sortedMessages = useMemo(() => {
    return [...(messages as WhatsAppMessage[])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [messages]);

  // ------- Sub-tab definitions -------

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'mensagens', label: 'Mensagens' },
    { key: 'campanhas', label: 'Campanhas' },
    { key: 'templates', label: 'Templates' },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Top-level navigation tabs (matching Notifications.tsx pattern) */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => navigate('/admin/notificacoes')}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Recebidas
          </button>
          <button
            onClick={() => navigate('/admin/notificacoes/central')}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Central de Envio
          </button>
          <button
            className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary"
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            WhatsApp
          </button>
        </div>

        {/* Page header */}
        <PageHeader
          title="WhatsApp Center"
          description="Gerencie mensagens, campanhas e templates WhatsApp"
          actions={
            activeTab === 'mensagens' ? (
              <Button size="sm" onClick={() => setSendDialogOpen(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Nova Mensagem
              </Button>
            ) : activeTab === 'campanhas' ? (
              <Button size="sm" onClick={() => setCampaignWizardOpen(true)}>
                <Users className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            ) : (
              <Button size="sm" onClick={handleCreateTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            )
          }
          howItWorks={[
            'Envie mensagens individuais ou em massa via WhatsApp',
            'Crie templates reutilizaveis com variaveis dinamicas',
            'Gerencie campanhas e monitore status de entrega',
          ]}
        />

        {/* Sub-tab pills */}
        <div className="flex gap-2" role="tablist" aria-label="Seções do WhatsApp Center">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ Sub-tab: Mensagens ============ */}
        {activeTab === 'mensagens' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <WhatsAppStatsCards stats={stats} />

            {/* Messages Table */}
            {sortedMessages.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Data</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead className="hidden md:table-cell">Template</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMessages.map((msg) => {
                        const templateName = (templates as WhatsAppTemplate[]).find(
                          (t) => t.id === msg.templateId,
                        )?.name;
                        return (
                          <TableRow key={msg.id}>
                            <TableCell className="text-xs text-muted-foreground tabular-nums">
                              {formatDateBR(msg.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {msg.recipientName ?? 'Desconhecido'}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {msg.recipientPhone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {templateName ?? '--'}
                            </TableCell>
                            <TableCell>
                              <WhatsAppStatusBadge status={msg.status} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    Nenhuma mensagem enviada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    As mensagens WhatsApp enviadas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ============ Sub-tab: Campanhas ============ */}
        {activeTab === 'campanhas' && (
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.campaignId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-foreground">
                              Campanha
                            </h3>
                            <Badge variant="outline" className="text-xs font-mono">
                              {campaign.campaignId.slice(0, 8)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              {formatDateBR(campaign.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" aria-hidden="true" />
                              {campaign.templateName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              {campaign.totalMessages}
                            </p>
                            <p className="text-[10px] text-muted-foreground">mensagens</p>
                          </div>
                          <div className="flex gap-1.5">
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent">
                              {campaign.sent} ok
                            </Badge>
                            {campaign.failed > 0 && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent">
                                {campaign.failed} falha{campaign.failed !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    Nenhuma campanha encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie uma campanha para enviar mensagens em massa.
                  </p>
                  <Button size="sm" onClick={() => setCampaignWizardOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ============ Sub-tab: Templates ============ */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {(templates as WhatsAppTemplate[]).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(templates as WhatsAppTemplate[]).map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium truncate">
                              {template.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px] border-transparent',
                                  whatsAppCategoryColors[template.category],
                                )}
                              >
                                {whatsAppCategoryLabels[template.category]}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px] border-transparent',
                                  template.isActive
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
                                )}
                              >
                                {template.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Ações do template</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleTemplate(template)}>
                                {template.isActive ? (
                                  <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmTemplate(template)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap font-mono leading-relaxed">
                          {template.messageText}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    Nenhum template criado
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie templates reutilizaveis para agilizar o envio de mensagens.
                  </p>
                  <Button size="sm" onClick={handleCreateTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ============ Dialogs ============ */}

        {/* Send individual message */}
        <SendMessageDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
        />

        {/* Bulk campaign wizard */}
        <BulkCampaignWizard
          open={campaignWizardOpen}
          onOpenChange={setCampaignWizardOpen}
        />

        {/* Template editor */}
        <WhatsAppTemplateEditor
          open={templateEditorOpen}
          onOpenChange={setTemplateEditorOpen}
          template={editingTemplate}
          onSave={handleSaveTemplate}
          isSaving={createTemplateMutation.isPending || updateTemplateMutation.isPending}
        />

        {/* Delete confirmation */}
        <AlertDialog
          open={!!deleteConfirmTemplate}
          onOpenChange={(open) => {
            if (!open) setDeleteConfirmTemplate(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir template</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o template{' '}
                <strong>{deleteConfirmTemplate?.name}</strong>? Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteTemplate();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteTemplateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

/**
 * Company Messages Page
 * PRD-017: Sistema de Mensagens da Empresa
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Send,
  MoreVertical,
  User,
  Check,
  CheckCheck,
  MessageSquare,
  ChevronLeft,
  Briefcase,
  ExternalLink,
  Users,
  X,
  FileText,
  Save,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks/useMessages';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';
import { useAuth } from '@/contexts/AuthContext';
import {
  TemplateSelector,
  ToneSelector,
  TemplatePreview,
  SaveTemplateModal,
} from '@/components/messages';
import { toast } from 'sonner';
import type { TemplateVariableData } from '@/types/messageTemplates';

export default function CompanyMessages() {
  const { currentCompany } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const {
    conversations,
    getConversationMessages,
    getLastMessage,
    markAsRead,
    sendMessage,
    totalUnreadCount,
  } = useMessages({ userId: currentCompany?.id ?? '', userType: 'company', selectedConversationId });
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // PRD-041: Message Templates
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const {
    templates,
    selectedTemplate,
    selectedTone,
    selectTemplate,
    setTone,
    getPreview,
    saveCustomTemplate,
    deleteCustomTemplate,
  } = useMessageTemplates({ companyId: currentCompany?.id ?? '' });

  // Get unique jobs from conversations for filter
  const jobOptions = useMemo(() => {
    const jobs = conversations.map(c => ({ id: c.jobId, title: c.jobTitle }));
    return [...new Map(jobs.map(j => [j.id, j])).values()];
  }, [conversations]);

  // Filter conversations by search and job filter
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch =
        searchTerm === '' ||
        conv.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = selectedJobFilter === 'all' || conv.jobId === selectedJobFilter;
      return matchesSearch && matchesJob;
    });
  }, [conversations, searchTerm, selectedJobFilter]);

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // PRD-041: Variable data for template substitution
  const templateVariableData: Partial<TemplateVariableData> = useMemo(() => {
    if (!selectedConversation) return {};
    return {
      nome: selectedConversation.candidateName,
      vaga: selectedConversation.jobTitle,
      empresa: currentCompany?.name ?? '',
    };
  }, [selectedConversation]);

  // Get messages for selected conversation
  const selectedMessages = selectedConversationId
    ? getConversationMessages(selectedConversationId)
    : [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessages]);

  // Mark as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessage(selectedConversationId, newMessage.trim());
    setNewMessage('');
    selectTemplate(null);
    setShowTemplatePreview(false);
  };

  // PRD-041: Handle template selection
  const handleTemplateSelect = (template: typeof selectedTemplate) => {
    if (!template) return;
    selectTemplate(template.id);
    const preview = getPreview(templateVariableData);
    setNewMessage(preview);
    setShowTemplatePreview(true);
    toast.success(`Template "${template.name}" aplicado`);
  };

  // PRD-041: Handle saving custom template
  const handleSaveCustomTemplate = (name: string, content: string, category: string) => {
    saveCustomTemplate(name, content, category as 'invitation' | 'feedback' | 'rejection' | 'followup' | 'welcome' | 'custom');
    toast.success('Template salvo com sucesso!');
  };

  // Format date/time for display
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedJobFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedJobFilter !== 'all';

  return (
    <DashboardLayout userType="company">
      <div className="h-[calc(100vh-8rem)]">
        <div className="bg-card rounded-2xl shadow-soft h-full overflow-hidden flex">
          {/* Conversations List */}
          <div
            className={cn(
              'w-full md:w-80 border-r border-border flex flex-col',
              selectedConversationId ? 'hidden md:flex' : 'flex'
            )}
          >
            {/* Header with filters */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  Mensagens
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </h2>
              </div>

              {/* Search by candidate */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar candidato..."
                  className="pl-9 pr-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter by job */}
              <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as vagas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as vagas</SelectItem>
                  {jobOptions.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conversations list */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conv => {
                    const lastMessage = getLastMessage(conv.id);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left',
                          selectedConversationId === conv.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted',
                          conv.unreadCount > 0 && 'bg-secondary/5'
                        )}
                      >
                        {/* Candidate avatar */}
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-secondary">
                            {conv.candidateName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={cn(
                                'font-medium text-foreground truncate',
                                conv.unreadCount > 0 && 'font-semibold'
                              )}
                            >
                              {conv.candidateName}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {lastMessage ? formatMessageTime(lastMessage.createdAt) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {conv.jobTitle}
                          </p>
                          <p
                            className={cn(
                              'text-sm truncate',
                              conv.unreadCount > 0
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground'
                            )}
                          >
                            {lastMessage?.content || 'Sem mensagens'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : conversations.length === 0 ? (
                  // Empty state - no conversations at all
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhuma conversa
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      As conversas com candidatos aparecerão aqui
                    </p>
                    <Button asChild>
                      <Link to="/empresa/banco-talentos">
                        <Users className="w-4 h-4 mr-2" />
                        Explorar Banco de Talentos
                      </Link>
                    </Button>
                  </div>
                ) : (
                  // No results for filters
                  <div className="text-center py-8 px-4">
                    <p className="text-muted-foreground mb-4">
                      Nenhuma conversa encontrada com os filtros aplicados
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              'flex-1 flex flex-col',
              !selectedConversationId ? 'hidden md:flex' : 'flex'
            )}
          >
            {selectedConversationId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className="md:hidden p-2 hover:bg-muted rounded-lg"
                      onClick={() => setSelectedConversationId(null)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="font-semibold text-secondary">
                        {selectedConversation.candidateName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedConversation.candidateName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="w-3 h-3" />
                        <span>{selectedConversation.jobTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                      <Link to={`/empresa/candidaturas`}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver candidatura
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/empresa/banco-talentos/${selectedConversation.candidateId}`}>
                            <User className="w-4 h-4 mr-2" />
                            Ver perfil do candidato
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="sm:hidden">
                          <Link to={`/empresa/candidaturas`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver candidatura
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedMessages.map(msg => {
                      const isOwn = msg.senderType === 'company';

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-2xl px-4 py-3',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted text-foreground rounded-bl-md'
                            )}
                          >
                            <p>{msg.content}</p>
                            <div
                              className={cn(
                                'flex items-center gap-1 mt-1 text-xs',
                                isOwn
                                  ? 'text-primary-foreground/70 justify-end'
                                  : 'text-muted-foreground'
                              )}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isOwn &&
                                (msg.read ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border space-y-3">
                  {/* PRD-041: Template controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplateSelector(true)}
                      className="gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Templates</span>
                    </Button>

                    {showTemplatePreview && selectedTemplate && (
                      <>
                        <ToneSelector
                          selectedTone={selectedTone}
                          onToneChange={(tone) => {
                            setTone(tone);
                            const preview = getPreview(templateVariableData);
                            setNewMessage(preview);
                          }}
                          className="flex-1 min-w-0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            selectTemplate(null);
                            setNewMessage('');
                            setShowTemplatePreview(false);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {newMessage.trim() && !selectedTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSaveTemplateModal(true)}
                        className="gap-1 ml-auto"
                      >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Salvar como template</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // No conversation selected
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Mensagens com candidatos
                  </h3>
                  <p className="text-muted-foreground">Selecione uma conversa para visualizar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRD-041: Template Selector Modal */}
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        templates={templates}
        onSelect={handleTemplateSelect}
        onDelete={deleteCustomTemplate}
      />

      {/* PRD-041: Save Template Modal */}
      <SaveTemplateModal
        open={showSaveTemplateModal}
        onOpenChange={setShowSaveTemplateModal}
        content={newMessage}
        onSave={handleSaveCustomTemplate}
      />
    </DashboardLayout>
  );
}

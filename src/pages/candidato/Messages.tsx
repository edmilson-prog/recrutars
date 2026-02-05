/**
 * Candidate Messages Page
 * PRD-010: Sistema de Mensagens do Candidato
 * PRD-016: Mensagem especial de solicitação de teste
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Send,
  MoreVertical,
  Building2,
  Check,
  CheckCheck,
  MessageSquare,
  ChevronLeft,
  Briefcase,
  Clock,
  ClipboardList,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/types';

// PRD-016: Check if message is test request
const isTestRequestMessage = (msg: Message): boolean =>
  msg.type === 'solicitacao_teste';

export default function CandidateMessages() {
  const { user } = useAuth();
  const {
    conversations,
    getConversationMessages,
    getLastMessage,
    markAsRead,
    sendMessage,
  } = useMessages({ userId: user?.id ?? '', userType: 'candidate' });

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations by search term
  const filteredConversations = conversations.filter(
    conv =>
      conv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Get messages for selected conversation
  const selectedMessages = selectedConversationId
    ? getConversationMessages(selectedConversationId)
    : [];

  // Scroll to bottom when messages change or conversation is selected
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

  // Clear search
  const clearSearch = () => setSearchTerm('');

  return (
    <DashboardLayout userType="candidate">
      <div className="h-[calc(100vh-8rem)]">
        <div className="bg-card rounded-2xl shadow-soft h-full overflow-hidden flex">
          {/* Conversations List */}
          <div
            className={cn(
              'w-full md:w-80 border-r border-border flex flex-col',
              selectedConversationId ? 'hidden md:flex' : 'flex'
            )}
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Mensagens</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  className="pl-9 pr-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

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
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={cn(
                                'font-medium text-foreground truncate',
                                conv.unreadCount > 0 && 'font-semibold'
                              )}
                            >
                              {conv.companyName}
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
                      Você ainda não tem mensagens
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      As empresas entrarão em contato quando houver interesse em seu perfil
                    </p>
                  </div>
                ) : (
                  // No results for search
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma conversa encontrada
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedConversation.companyName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="w-3 h-3" />
                        <span>{selectedConversation.jobTitle}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedMessages.map(msg => {
                      const isOwn = msg.senderType === 'candidate';

                      // PRD-016: Special rendering for test request messages
                      if (isTestRequestMessage(msg)) {
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-[85%]">
                              <div className="flex items-center gap-2 mb-2">
                                <ClipboardList className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-foreground">
                                  Solicitação de Teste
                                </span>
                              </div>
                              <p className="text-sm text-foreground mb-3">{msg.content}</p>

                              {msg.metadata && (
                                <div className="bg-background rounded-lg p-3 space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-foreground">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <span>{msg.metadata.jobTitle}</span>
                                  </div>
                                  {msg.metadata.deadline && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        Prazo:{' '}
                                        {new Date(msg.metadata.deadline).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex gap-2 mt-4">
                                <Button size="sm" asChild>
                                  <Link to="/candidato/testes">Realizar Teste</Link>
                                </Button>
                                {msg.metadata?.jobId && (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/candidato/vagas/${msg.metadata.jobId}`}>
                                      Ver Vaga
                                    </Link>
                                  </Button>
                                )}
                              </div>

                              <div className="text-xs text-muted-foreground mt-3">
                                {formatMessageTime(msg.createdAt)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      // Regular message rendering
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
                <div className="p-4 border-t border-border">
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">Suas mensagens</h3>
                  <p className="text-muted-foreground">Selecione uma conversa para visualizar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

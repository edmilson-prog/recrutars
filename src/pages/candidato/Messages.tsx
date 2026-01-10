import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, MoreVertical, Building2, User, Clock, Check, CheckCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { mockMessages, mockCompanies, mockCandidates } from '@/data/mockData';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantType: 'company' | 'candidate';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export default function CandidateMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock conversations for candidate
  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      participantId: 'company-1',
      participantName: 'Tech Solutions',
      participantType: 'company',
      lastMessage: 'Olá João! Ficamos muito impressionados com seu perfil.',
      lastMessageTime: '14:30',
      unreadCount: 0,
    },
    {
      id: 'conv-2',
      participantId: 'company-2',
      participantName: 'Inovação Digital',
      participantType: 'company',
      lastMessage: 'Seu portfolio nos chamou atenção. Gostaríamos de conversar.',
      lastMessageTime: '09:00',
      unreadCount: 1,
    },
    {
      id: 'conv-3',
      participantId: 'company-3',
      participantName: 'StartUp Brasil',
      participantType: 'company',
      lastMessage: 'Parabéns! Você foi aprovada em nosso processo.',
      lastMessageTime: 'Ontem',
      unreadCount: 0,
    },
  ];

  // Mock chat messages
  const chatMessages: Record<string, ChatMessage[]> = {
    'conv-1': [
      { id: '1', senderId: 'company-1', content: 'Olá João! Ficamos muito impressionados com seu perfil. Gostaríamos de agendar uma entrevista técnica.', timestamp: '14:30', read: true },
      { id: '2', senderId: 'candidate-1', content: 'Olá! Muito obrigado pelo retorno. Tenho disponibilidade na terça e quarta-feira, período da tarde.', timestamp: '16:45', read: true },
      { id: '3', senderId: 'company-1', content: 'Perfeito! Vamos agendar para terça às 15h. Enviaremos o link da reunião por email.', timestamp: '17:00', read: true },
      { id: '4', senderId: 'candidate-1', content: 'Combinado! Aguardo o email. Obrigado!', timestamp: '17:05', read: true },
    ],
    'conv-2': [
      { id: '1', senderId: 'company-2', content: 'Olá! Seu portfolio nos chamou atenção. Gostaríamos de convidá-lo para realizar nosso teste comportamental.', timestamp: '09:00', read: false },
    ],
    'conv-3': [
      { id: '1', senderId: 'company-3', content: 'Parabéns! Você foi aprovada em nosso processo seletivo.', timestamp: 'Ontem', read: true },
      { id: '2', senderId: 'company-3', content: 'Estamos preparando uma proposta formal que será enviada em breve.', timestamp: 'Ontem', read: true },
      { id: '3', senderId: 'candidate-1', content: 'Muito obrigada! Estou muito feliz com a notícia. Aguardo a proposta!', timestamp: 'Ontem', read: true },
    ],
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    // In a real app, this would send to backend
    setNewMessage('');
  };

  const selectedChat = selectedConversation ? chatMessages[selectedConversation] : [];
  const selectedParticipant = conversations.find(c => c.id === selectedConversation);

  return (
    <DashboardLayout userType="candidate">
      <div className="h-[calc(100vh-8rem)]">
        <div className="bg-card rounded-2xl shadow-soft h-full overflow-hidden flex">
          {/* Conversations List */}
          <div className={cn(
            "w-full md:w-80 border-r border-border flex flex-col",
            selectedConversation ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Mensagens</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left",
                      selectedConversation === conv.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate">
                          {conv.participantName}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma conversa encontrada
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !selectedConversation ? "hidden md:flex" : "flex"
          )}>
            {selectedConversation && selectedParticipant ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className="md:hidden p-2 hover:bg-muted rounded-lg"
                      onClick={() => setSelectedConversation(null)}
                    >
                      ←
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedParticipant.participantName}</h3>
                      <span className="text-sm text-muted-foreground">Empresa</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedChat.map((msg) => {
                      const isOwn = msg.senderId === 'candidate-1';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          )}>
                            <p>{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs",
                              isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                            )}>
                              <span>{msg.timestamp}</span>
                              {isOwn && (
                                msg.read
                                  ? <CheckCheck className="w-3 h-3" />
                                  : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
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
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
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

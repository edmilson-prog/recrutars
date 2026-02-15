/**
 * Types for Messages
 * PRD-004: Tipos e Interfaces TypeScript
 * PRD-010: Adicionado Conversation e conversationId
 * PRD-016: Adicionado MessageType e TestRequestMetadata
 */

export type MessageSenderType = 'company' | 'candidate';

export type MessageType = 'regular' | 'solicitacao_teste';

export interface TestRequestMetadata {
  jobId: string;
  jobTitle: string;
  deadline?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: MessageSenderType;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  type?: MessageType;
  metadata?: TestRequestMetadata;
}

export interface Conversation {
  id: string;
  candidateId: string;
  candidateName: string;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  unreadCount: number;
  updatedAt: string;
  lastMessage?: Message;
}

export type Conversation = {
  id: number;
  userId: number;
  userFullName: string;
  barberId: number;
  barberFullName: string;
  barberSpecialty: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessage: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderFullName: string;
  content: string;
  isMine: boolean;
  isRead: boolean;
  createdAt: string;
};

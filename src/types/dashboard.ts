export interface BotMessage {
  id: string;
  groupId: string;
  groupName: string;
  messageText: string;
  command: string;
  timestamp: Date;
  isReaction: boolean;
  reactionEmoji?: string;
  senderPhone: string;
  senderName?: string;
  chatType: 'group' | 'private';
  reactionToMessageId?: string;
  reactionToMessageText?: string;
  botResponse?: string;
  botResponseTimestamp?: Date;
  botResponseImage?: string;
}

export interface BotGroup {
  id: string;
  name: string;
  messageCount: number;
  lastActivity: Date;
  chatType: 'group' | 'private';
}

export interface BotStatus {
  isRunning: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdate: Date;
  commandCount: number;
  groupCount: number;
}
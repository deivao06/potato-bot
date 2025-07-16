import express from 'express';
import cors from 'cors';
import { BotMessage, BotGroup, BotStatus } from '../types/dashboard';
import PotatoBot from '../Classes/PotatoBot';

export class DashboardServer {
  private app: express.Application;
  private botMessages: BotMessage[] = [];
  private botGroups: Map<string, BotGroup> = new Map();
  private botInstance: PotatoBot | null = null;
  private messageCache: Map<string, BotMessage> = new Map(); // Cache for reaction lookup
  private botStatus: BotStatus = {
    isRunning: false,
    connectionStatus: 'disconnected',
    lastUpdate: new Date(),
    commandCount: 0,
    groupCount: 0
  };

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Get bot status
    this.app.get('/api/status', (req, res) => {
      res.json(this.botStatus);
    });

    // Get bot messages
    this.app.get('/api/messages', (req, res) => {
      const limit = parseInt(req.query.limit as string) || 100;
      const messages = this.botMessages
        .slice(-limit)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      res.json(messages);
    });

    // Get bot chats (groups and private chats)
    this.app.get('/api/groups', (req, res) => {
      const groups = Array.from(this.botGroups.values());
      res.json(groups);
    });

    // Get messages for specific chat (group or private)
    this.app.get('/api/groups/:groupId/messages', (req, res) => {
      const { groupId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = this.botMessages
        .filter(msg => msg.groupId === groupId)
        .slice(-limit)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      res.json(messages);
    });
  }

  public setBotInstance(bot: PotatoBot): void {
    this.botInstance = bot;
    this.botStatus.isRunning = true;
    this.botStatus.lastUpdate = new Date();
  }

  public updateBotStatus(status: Partial<BotStatus>): void {
    this.botStatus = { ...this.botStatus, ...status, lastUpdate: new Date() };
  }

  public addBotMessage(message: BotMessage): void {
    this.botMessages.push(message);
    
    // Cache message for reaction lookup
    if (!message.isReaction) {
      this.messageCache.set(message.id, message);
    }
    
    // Update group info
    if (!this.botGroups.has(message.groupId)) {
      this.botGroups.set(message.groupId, {
        id: message.groupId,
        name: message.groupName,
        messageCount: 0,
        lastActivity: new Date(),
        chatType: message.chatType
      });
    }
    
    const group = this.botGroups.get(message.groupId)!;
    group.messageCount++;
    group.lastActivity = new Date();
    
    // Update bot status
    this.botStatus.commandCount++;
    this.botStatus.groupCount = this.botGroups.size;
    this.botStatus.lastUpdate = new Date();
  }

  public getMessageById(messageId: string): BotMessage | undefined {
    return this.messageCache.get(messageId);
  }

  public updateBotResponse(messageId: string, response: string, imageUrl?: string): void {
    // Update in cache
    const cachedMessage = this.messageCache.get(messageId);
    if (cachedMessage) {
      cachedMessage.botResponse = response;
      cachedMessage.botResponseTimestamp = new Date();
      if (imageUrl) {
        cachedMessage.botResponseImage = imageUrl;
      }
    }
    
    // Update in messages array
    const message = this.botMessages.find(msg => msg.id === messageId);
    if (message) {
      message.botResponse = response;
      message.botResponseTimestamp = new Date();
      if (imageUrl) {
        message.botResponseImage = imageUrl;
      }
    }
  }

  public start(port: number = 3001): void {
    this.app.listen(port, () => {
      console.log(`Dashboard server running on port ${port}`);
    });
  }
}

export const dashboardServer = new DashboardServer();
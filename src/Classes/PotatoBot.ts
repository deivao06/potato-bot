import makeWASocket, { AuthenticationState, ConnectionState, DisconnectReason, useMultiFileAuthState } from "baileys";
import P from 'pino'
import QRCode from 'qrcode'
import { Boom } from "@hapi/boom";
import { BaseCommand } from '../Commands/BaseCommand';
import { CommandRegistry } from '../Commands/CommandRegistry';
import { dashboardServer } from '../api/dashboard-server';
import { BotMessage } from '../types/dashboard';

interface BotInterface {
    prefixes: string[];
    sock: any;
    commandRegistry: CommandRegistry;
}

// Claude, don't insert specific command rules here, keep specific command rules for the specific rule.
export default class PotatoBot implements BotInterface {
    prefixes: string[];
    sock: any;
    saveCreds: any;
    commandRegistry: CommandRegistry;
    private groupMetadataCache: Map<string, any> = new Map();

    constructor() {
        this.prefixes = ['!', '-'];
        this.commandRegistry = new CommandRegistry();
        this.initializeBot();
        
        // Initialize dashboard server
        dashboardServer.setBotInstance(this);
        dashboardServer.start();
        
        // Clear group metadata cache every 30 minutes to prevent memory issues
        setInterval(() => {
            this.groupMetadataCache.clear();
            console.log('Group metadata cache cleared');
        }, 30 * 60 * 1000);
    }

    private async initializeBot(): Promise<void> {
        await this.commandRegistry.loadCommands();
        console.log(`Loaded ${this.commandRegistry.getCommandNames().length} commands: ${this.commandRegistry.getCommandNames().join(', ')}`);
        
        this.startSock().then(() => { 
            this.sock.ev.on('connection.update', this.connectionUpdate);
            this.sock.ev.on('messages.upsert', this.messagesUpsert);
            this.sock.ev.on('messages.reaction', this.handleReaction);
            this.sock.ev.on("creds.update", this.saveCreds);
            
            console.log('Event listeners set up successfully');
        });
    }

    async startSock(): Promise<void> {
        const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

        this.saveCreds = saveCreds;

        this.sock = makeWASocket({
            auth: state,
            logger: P(),
            shouldSyncHistoryMessage: () => false
        });
    }

    async restartConnection(): Promise<void> {
        this.startSock().then(() => { 
            this.sock.ev.on('connection.update', this.connectionUpdate);
            this.sock.ev.on('messages.upsert', this.messagesUpsert);
            this.sock.ev.on('messages.reaction', this.handleReaction);
            this.sock.ev.on("creds.update", this.saveCreds);
        });
    }

    connectionUpdate = async (update: Partial<ConnectionState>): Promise<void> => {
        const {connection, lastDisconnect, qr } = update

        // Update dashboard with connection status
        if (connection === 'open') {
            dashboardServer.updateBotStatus({
                connectionStatus: 'connected',
                isRunning: true
            });
        } else if (connection === 'close') {
            dashboardServer.updateBotStatus({
                connectionStatus: 'disconnected',
                isRunning: false
            });
        } else if (connection === 'connecting') {
            dashboardServer.updateBotStatus({
                connectionStatus: 'connecting',
                isRunning: true
            });
        }

        if (
            connection === 'close' 
            && (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired
        ) {
            await this.restartConnection();
            return;
        }

        if (qr) {
            console.log(await QRCode.toString(qr, {type:'terminal', small: true}))
        }
    }

    messagesUpsert = ({type, messages}: any) => {
        if (type == "notify") { // new messages
            for (const messageInfo of messages) {
                const messageText = messageInfo.message?.conversation;

                if (messageText && this.isCommand(messageText)) {
                    this.handleCommand(messageText, messageInfo);
                }
            }
        }
    }

    handleReaction = async (reactions: any) => {
        console.log('=== REACTION EVENT TRIGGERED ===');
        console.log('Reaction event received:', JSON.stringify(reactions, null, 2));
        
        for (const reaction of reactions) {
            console.log('Processing reaction:', JSON.stringify(reaction, null, 2));
            
            if (reaction.reaction?.text) {
                console.log('Found reaction message:', reaction.reaction?.text);
                
                // Extract reaction info
                const remoteJid = reaction.key?.remoteJid || 'unknown';
                const senderPhone = reaction.key?.participant || reaction.key?.fromMe ? 'bot' : 'unknown';
                const isGroup = remoteJid.includes('@g.us');
                const chatType = isGroup ? 'group' : 'private';
                
                // Get chat name
                let chatName = 'Unknown';
                if (isGroup) {
                    chatName = await this.getGroupName(remoteJid);
                } else {
                    // For private chats, use sender's name if available, otherwise show phone number
                    if (reaction.pushName) {
                        chatName = `${reaction.pushName} (Private)`;
                    } else {
                        const formattedPhone = senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', '');
                        chatName = `${formattedPhone} (Private)`;
                    }
                }

                // Try to find the original message that was reacted to
                const originalMessage = dashboardServer.getMessageById(reaction.key?.id || '');
                
                // Log reaction to dashboard
                const botMessage: BotMessage = {
                    id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    groupId: remoteJid,
                    groupName: chatName,
                    messageText: `Reacted with ${reaction.reaction.text}`,
                    command: 'reaction',
                    timestamp: new Date(),
                    isReaction: true,
                    reactionEmoji: reaction.reaction.text,
                    senderPhone: senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', ''),
                    senderName: reaction.pushName || 'Unknown',
                    chatType: chatType,
                    reactionToMessageId: originalMessage?.id,
                    reactionToMessageText: originalMessage?.messageText
                };
                
                dashboardServer.addBotMessage(botMessage);
                
                // Check if it's a Steam command reaction
                const steamCommand = this.commandRegistry.getCommand('steam');
                if (steamCommand && 'handleReaction' in steamCommand) {
                    console.log('Calling Steam command handleReaction');
                    
                    // Create a wrapper sock to capture bot responses from reactions
                    const sockWithLogging = {
                        ...this.sock,
                        sendMessage: async (jid: string, content: any) => {
                            // Capture the bot response from the reaction
                            const response = content.text || content.caption || JSON.stringify(content);
                            
                            // Extract image URL if present
                            let imageUrl: string | undefined;
                            if (content.image && content.image.url) {
                                imageUrl = content.image.url;
                            }
                            
                            dashboardServer.updateBotResponse(botMessage.id, response, imageUrl);
                            
                            // Send the actual message
                            return await this.sock.sendMessage(jid, content);
                        }
                    };
                    
                    (steamCommand as any).handleReaction(reaction, sockWithLogging);
                } else {
                    console.log('Steam command not found or no handleReaction method');
                }
            } else {
                console.log('No reactionMessage found in reaction');
            }
        }
    }

    private isCommand(messageText: string): boolean {
        return this.prefixes.some(prefix => messageText.startsWith(prefix));
    }

    private async getGroupName(jid: string): Promise<string> {
        try {
            // Check cache first
            if (this.groupMetadataCache.has(jid)) {
                const cached = this.groupMetadataCache.get(jid);
                return cached.subject || 'Unknown Group';
            }

            // Fetch from WhatsApp
            const metadata = await this.sock.groupMetadata(jid);
            
            // Cache the result
            this.groupMetadataCache.set(jid, metadata);
            
            return metadata.subject || 'Unknown Group';
        } catch (error) {
            console.error('Error fetching group metadata:', error);
            return 'Unknown Group';
        }
    }

    private async handleCommand(messageText: string, messageInfo: any): Promise<void> {
        const usedPrefix = this.prefixes.find(prefix => messageText.startsWith(prefix));
        if (!usedPrefix) return;

        const commandWithArgs = messageText.slice(usedPrefix.length).trim();
        const [commandName, ...args] = commandWithArgs.split(' ');

        const command = this.commandRegistry.getCommand(commandName.toLowerCase());
        if (command) {
            // Extract phone number and chat info
            const remoteJid = messageInfo.key?.remoteJid || 'unknown';
            const senderPhone = messageInfo.key?.participant || messageInfo.key?.remoteJid || 'unknown';
            const isGroup = remoteJid.includes('@g.us');
            const chatType = isGroup ? 'group' : 'private';
            
            // Get chat name
            let chatName = 'Unknown';
            if (isGroup) {
                chatName = await this.getGroupName(remoteJid);
            } else {
                // For private chats, use sender's name if available, otherwise show phone number
                if (messageInfo.pushName) {
                    chatName = `${messageInfo.pushName} (Private)`;
                } else {
                    const formattedPhone = senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', '');
                    chatName = `${formattedPhone} (Private)`;
                }
            }

            // Log command to dashboard
            const botMessage: BotMessage = {
                id: messageInfo.key?.id || Date.now().toString(),
                groupId: remoteJid,
                groupName: chatName,
                messageText: messageText,
                command: commandName,
                timestamp: new Date(messageInfo.messageTimestamp * 1000),
                isReaction: false,
                senderPhone: senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', ''),
                senderName: messageInfo.pushName,
                chatType: chatType
            };
            
            dashboardServer.addBotMessage(botMessage);

            // Create a wrapper sock to capture bot responses
            const sockWithLogging = {
                ...this.sock,
                sendMessage: async (jid: string, content: any) => {
                    // Capture the bot response
                    const response = content.text || content.caption || JSON.stringify(content);
                    
                    // Extract image URL if present
                    let imageUrl: string | undefined;
                    if (content.image && content.image.url) {
                        imageUrl = content.image.url;
                    }
                    
                    dashboardServer.updateBotResponse(botMessage.id, response, imageUrl);
                    
                    // Send the actual message
                    return await this.sock.sendMessage(jid, content);
                }
            };

            await command.execute({
                messageInfo,
                args,
                sock: sockWithLogging
            });
        }
    }
}
import { BaseCommand, CommandContext } from './BaseCommand';

export class PingCommand extends BaseCommand {
    name = 'ping';
    description = 'Returns a Pong! message to test bot responsiveness';

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, sock } = context;
        
        await sock?.sendMessage(messageInfo.key.remoteJid!, {
            text: "Pong! 🏓"
        });
    }
}
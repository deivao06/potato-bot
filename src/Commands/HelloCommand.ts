import { BaseCommand, CommandContext } from './BaseCommand';

export class HelloCommand extends BaseCommand {
    name = 'hello';
    description = 'Returns a Hello World message';

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, sock } = context;
        
        await sock?.sendMessage(messageInfo.key.remoteJid!, {
            text: "Hello World"
        });
    }
}
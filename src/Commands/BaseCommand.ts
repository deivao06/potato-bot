export interface CommandContext {
    messageInfo: any;
    args: string[];
    sock: any;
    bot?: any; // Optional bot instance for accessing methods like addPendingSelection
}

export abstract class BaseCommand {
    abstract name: string;
    abstract description: string;

    abstract execute(context: CommandContext): Promise<void>;
}
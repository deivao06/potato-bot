export interface CommandContext {
    messageInfo: any;
    args: string[];
    sock: any;
}

export abstract class BaseCommand {
    abstract name: string;
    abstract description: string;

    abstract execute(context: CommandContext): Promise<void>;
}
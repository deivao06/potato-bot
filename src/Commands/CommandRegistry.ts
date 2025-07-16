import { readdirSync } from 'fs';
import { join } from 'path';
import { BaseCommand } from './BaseCommand';

export class CommandRegistry {
    private commands: Map<string, BaseCommand> = new Map();

    async loadCommands(): Promise<void> {
        const commandsDir = __dirname;
        const files = readdirSync(commandsDir);

        for (const file of files) {
            if (file.endsWith('Command.ts') || file.endsWith('Command.js')) {
                try {
                    const modulePath = join(commandsDir, file);
                    const module = await import(modulePath);
                    
                    // Look for exported classes that extend BaseCommand
                    for (const exportName in module) {
                        const ExportedClass = module[exportName];
                        
                        if (ExportedClass && 
                            typeof ExportedClass === 'function' && 
                            ExportedClass.prototype instanceof BaseCommand) {
                            
                            const commandInstance = new ExportedClass();
                            this.commands.set(commandInstance.name, commandInstance);
                            console.log(`Registered command: ${commandInstance.name}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error loading command from ${file}:`, error);
                }
            }
        }
    }

    getCommand(name: string): BaseCommand | undefined {
        return this.commands.get(name.toLowerCase());
    }

    getAllCommands(): Map<string, BaseCommand> {
        return this.commands;
    }

    getCommandNames(): string[] {
        return Array.from(this.commands.keys());
    }
}
# 🥔 Potato Bot

A modern WhatsApp bot built with TypeScript and Baileys, designed for easy command creation and extensibility.

## 🚀 Technologies Used

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript for better development experience
- **[Baileys](https://baileys.wiki/)** - WhatsApp Web API library for Node.js
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[QRCode](https://www.npmjs.com/package/qrcode)** - QR code generation for WhatsApp authentication
- **[Pino](https://getpino.io/)** - Fast JSON logger (included with Baileys)

## 📋 Features

- **Automatic Command Registration** - Commands are automatically discovered and registered
- **Type-Safe Architecture** - Built with TypeScript for better code quality
- **Modular Design** - Each command is a separate class for easy maintenance
- **Easy to Extend** - Simple command creation process
- **WhatsApp Integration** - Full WhatsApp Web API support via Baileys

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd potato-bot
```

2. Install dependencies:
```bash
yarn install
```

3. Build the project:
```bash
yarn build
```

4. Start the bot:
```bash
yarn start:dev
```

5. Scan the QR code that appears in the terminal with your WhatsApp app

## 🎯 How It Works

### Bot Architecture

The bot consists of several key components:

1. **PotatoBot Class** (`src/Classes/PotatoBot.ts`) - Main bot class that handles:
   - WhatsApp connection management
   - Message processing
   - Command execution
   - Authentication handling

2. **CommandRegistry** (`src/Commands/CommandRegistry.ts`) - Automatically:
   - Scans the Commands directory for command files
   - Loads and registers commands dynamically
   - Manages command instances

3. **BaseCommand** (`src/Commands/BaseCommand.ts`) - Abstract base class that:
   - Defines the command interface
   - Provides type safety for command development
   - Standardizes command structure

### Message Flow

1. User sends a message starting with a prefix (`!` or `-`)
2. Bot detects it's a command using `isCommand()` method
3. Command name and arguments are extracted
4. CommandRegistry finds the appropriate command class
5. Command's `execute()` method is called with context
6. Bot sends the response back to WhatsApp

## 🔧 Creating New Commands

Creating a new command is simple and requires no configuration changes to the main bot code.

### Step 1: Create Command File

Create a new file in `src/Commands/` with the naming pattern `*Command.ts`:

```typescript
// src/Commands/MyNewCommand.ts
import { BaseCommand, CommandContext } from './BaseCommand';

export class MyNewCommand extends BaseCommand {
    name = 'mynew';
    description = 'Description of what this command does';

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, args, sock } = context;
        
        // Your command logic here
        await sock?.sendMessage(messageInfo.key.remoteJid!, {
            text: "Hello from my new command!"
        });
    }
}
```

### Step 2: That's it! 

The command is automatically registered when the bot starts. Users can now use:
- `!mynew` or `-mynew` to trigger the command

### Command Context

The `CommandContext` object provides:

- `messageInfo` - WhatsApp message information (sender, chat, etc.)
- `args` - Array of command arguments (e.g., `!command arg1 arg2`)
- `sock` - WhatsApp socket for sending messages

### Example Commands

#### Simple Response Command
```typescript
export class HelloCommand extends BaseCommand {
    name = 'hello';
    description = 'Returns a greeting message';

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, sock } = context;
        
        await sock?.sendMessage(messageInfo.key.remoteJid!, {
            text: "Hello World! 👋"
        });
    }
}
```

#### Command with Arguments
```typescript
export class EchoCommand extends BaseCommand {
    name = 'echo';
    description = 'Echoes back the provided message';

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, args, sock } = context;
        
        const message = args.join(' ') || 'Nothing to echo!';
        
        await sock?.sendMessage(messageInfo.key.remoteJid!, {
            text: `Echo: ${message}`
        });
    }
}
```

## 🎮 Available Commands

- `!hello` - Returns "Hello World"
- `!ping` - Returns "Pong! 🏓"

## ⚙️ Configuration

### Command Prefixes

The bot responds to commands starting with:
- `!` (exclamation mark)
- `-` (dash)

You can modify these in `src/Classes/PotatoBot.ts`:

```typescript
constructor() {
    this.prefixes = ['!', '-', '.']; // Add more prefixes
    // ...
}
```

### Adding More Message Types

The bot currently handles text messages. To handle other message types (images, documents, etc.), modify the `messagesUpsert` method in `PotatoBot.ts`.

## 🧪 Development

### Build the project
```bash
yarn build
```

### Run in development mode
```bash
yarn start:dev
```

### Project Structure
```
src/
├── Classes/
│   └── PotatoBot.ts          # Main bot class
├── Commands/
│   ├── BaseCommand.ts        # Base command class
│   ├── CommandRegistry.ts    # Automatic command registration
│   ├── HelloCommand.ts       # Example command
│   └── PingCommand.ts        # Example command
└── index.ts                  # Entry point
```

## 📝 Best Practices

1. **Command Naming**: Use descriptive names in lowercase
2. **Error Handling**: Always wrap command logic in try-catch blocks
3. **Type Safety**: Use TypeScript types, avoid `any`
4. **Documentation**: Add clear descriptions to your commands
5. **Testing**: Test commands thoroughly before deployment

## 🤝 Contributing

1. Create a new command following the guidelines above
2. Test the command thoroughly
3. Follow TypeScript best practices
4. Update documentation if needed

## 📄 License

ISC License

## 🐛 Troubleshooting

- **QR Code not appearing**: Make sure your terminal supports unicode characters
- **Commands not working**: Check that the command file follows the `*Command.ts` naming pattern
- **Build errors**: Ensure all dependencies are installed with `yarn install`

---

Built with ❤️ using TypeScript and Baileys
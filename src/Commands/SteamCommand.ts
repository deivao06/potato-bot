import { BaseCommand, CommandContext } from './BaseCommand';
import axios from 'axios';

interface SteamGame {
    appid: number;
    name: string;
}

interface SteamGameDetails {
    type: string;
    name: string;
    steam_appid: number;
    required_age: number;
    is_free: boolean;
    short_description: string;
    header_image: string;
    developers: string[];
    publishers: string[];
    price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
        initial_formatted: string;
        final_formatted: string;
    };
    categories: Array<{ id: number; description: string }>;
    genres: Array<{ id: string; description: string }>;
}

interface SteamPlayerCount {
    player_count: number;
    result: number;
}

export class SteamCommand extends BaseCommand {
    name = 'steam';
    description = 'Get Steam game information including player count, price, and details';
    private pendingSelections: Map<string, SteamGame[]> = new Map();
    private selectionMessages: Map<string, string> = new Map(); // chatId -> messageId

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, args, sock } = context;
        
        if (args.length === 0) {
            await sock?.sendMessage(messageInfo.key.remoteJid!, {
                text: "❌ Please provide a game name!\nExample: !steam Counter-Strike 2"
            });
            return;
        }

        const gameName = args.join(' ');
        
        try {
            await sock?.sendMessage(messageInfo.key.remoteJid!, {
                text: "🔍 Searching for games..."
            });

            const games = await this.findGames(gameName);
            
            if (!games || games.length === 0) {
                await sock?.sendMessage(messageInfo.key.remoteJid!, {
                    text: `❌ No games found matching "${gameName}".`
                });
                return;
            }

            if (games.length === 1) {
                // If only one game found, show it directly
                const gameInfo = await this.getFullGameInfo(games[0]);
                await this.sendGameInfo(gameInfo, sock, messageInfo.key.remoteJid!);
            } else {
                // Show selection menu for multiple games
                await this.showGameSelection(games, sock, messageInfo);
            }

        } catch (error) {
            console.error('Steam command error:', error);
            await sock?.sendMessage(messageInfo.key.remoteJid!, {
                text: "❌ Error fetching game information. Please try again later."
            });
        }
    }

    async handleReaction(reactionInfo: any, sock: any): Promise<void> {
        console.log('Steam handleReaction called with:', JSON.stringify(reactionInfo, null, 2));
        
        const chatId = reactionInfo.key.remoteJid;
        const messageId = reactionInfo.key.id;
        console.log('Chat ID:', chatId);
        console.log('Message ID:', messageId);
        
        // Check if this reaction is for a valid selection message
        const expectedMessageId = this.selectionMessages.get(chatId);
        if (!expectedMessageId || expectedMessageId !== messageId) {
            console.log('Reaction not for selection message. Expected:', expectedMessageId, 'Got:', messageId);
            return;
        }
        
        const pendingGames = this.pendingSelections.get(chatId);
        console.log('Pending games for chat:', pendingGames);
        
        if (!pendingGames) {
            console.log('No pending games found for this chat');
            return;
        }

        const reaction = reactionInfo.reaction?.text;
        console.log('Reaction emoji:', reaction);
        
        let selectedGameIndex = -1;

        // Map reactions to game indices
        switch (reaction) {
            case '👍': selectedGameIndex = 0; break;
            case '❤️': selectedGameIndex = 1; break;
            case '🙏': selectedGameIndex = 2; break;
            case '😮': selectedGameIndex = 3; break;
            case '😢': selectedGameIndex = 4; break;
            case '😂': selectedGameIndex = 5; break;
            default: 
                console.log('Unknown reaction emoji:', reaction);
                return;
        }

        console.log('Selected game index:', selectedGameIndex);

        if (selectedGameIndex < pendingGames.length) {
            const selectedGame = pendingGames[selectedGameIndex];
            console.log('Selected game:', selectedGame);
            
            // Clean up tracking for this chat
            this.pendingSelections.delete(chatId);
            this.selectionMessages.delete(chatId);
            
            try {
                const gameInfo = await this.getFullGameInfo(selectedGame);
                await this.sendGameInfo(gameInfo, sock, chatId);
                console.log('Game info sent successfully');
            } catch (error) {
                console.error('Error getting selected game info:', error);
                await sock?.sendMessage(chatId, {
                    text: "❌ Error getting game information."
                });
            }
        } else {
            console.log('Selected index out of range');
        }
    }

    private async findGames(gameName: string): Promise<SteamGame[] | null> {
        try {
            // Get list of all Steam games
            const gamesResponse = await axios.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
            const games: SteamGame[] = gamesResponse.data.applist.apps;

            // Find games that contain the search term (case-insensitive for search, but return original names)
            const matchingGames = games.filter(g => 
                g.name.toLowerCase().includes(gameName.toLowerCase())
            ).slice(0, 6); // Get first 6 matches

            return matchingGames.length > 0 ? matchingGames : null;

        } catch (error) {
            console.error('Error fetching games:', error);
            return null;
        }
    }

    private async getFullGameInfo(game: SteamGame): Promise<any> {
        try {
            // Get detailed game information
            const [gameDetails, playerCount] = await Promise.all([
                this.getGameDetails(game.appid),
                this.getPlayerCount(game.appid)
            ]);

            return {
                ...gameDetails,
                player_count: playerCount,
                appid: game.appid
            };

        } catch (error) {
            console.error('Error fetching game info:', error);
            throw error;
        }
    }

    private async showGameSelection(games: SteamGame[], sock: any, messageInfo: any): Promise<void> {
        const chatId = messageInfo.key.remoteJid!;
        
        // Store pending selection for this chat
        this.pendingSelections.set(chatId, games);

        let selectionText = "🎮 Found multiple games! React to select:\n\n";
        
        const emojis = ['👍', '❤️', '🙏', '😮', '😢', '😂'];
        games.forEach((game, index) => {
            if (index < 6) {
                selectionText += `${emojis[index]} ${game.name}\n`;
            }
        });

        selectionText += "\n💡 React with the emoji to select your game!";

        const sentMessage = await sock?.sendMessage(chatId, {
            text: selectionText
        });

        // Store the message ID for reaction validation
        if (sentMessage && sentMessage.key && sentMessage.key.id) {
            this.selectionMessages.set(chatId, sentMessage.key.id);
            console.log('Stored selection message ID:', sentMessage.key.id, 'for chat:', chatId);
        }

        // Set timeout to clear pending selection after 60 seconds
        setTimeout(() => {
            this.pendingSelections.delete(chatId);
            this.selectionMessages.delete(chatId);
        }, 60000);
    }

    private async sendGameInfo(gameInfo: any, sock: any, chatId: string): Promise<void> {
        const response = this.formatGameInfo(gameInfo);
        
        // Send image with caption if header_image is available
        if (gameInfo.header_image) {
            await sock?.sendMessage(chatId, {
                image: { url: gameInfo.header_image },
                caption: response
            });
        } else {
            // Fallback to text only if no image
            await sock?.sendMessage(chatId, {
                text: response
            });
        }
    }

    private async getGameDetails(appId: number): Promise<SteamGameDetails | null> {
        try {
            const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
            const gameData = response.data[appId];
            
            if (gameData && gameData.success) {
                return gameData.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching game details:', error);
            return null;
        }
    }

    private async getPlayerCount(appId: number): Promise<number> {
        try {
            const response = await axios.get(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);
            const data: SteamPlayerCount = response.data.response;
            return data.player_count || 0;
        } catch (error) {
            console.error('Error fetching player count:', error);
            return 0;
        }
    }

    private formatGameInfo(gameInfo: any): string {
        const {
            name,
            appid,
            is_free,
            short_description,
            developers = [],
            publishers = [],
            price_overview,
            categories = [],
            genres = [],
            player_count,
            header_image
        } = gameInfo;

        let response = `🎮 **${name}**\n\n`;
        response += `📱 **App ID:** ${appid}\n`;
        response += `👥 **Current Players:** ${player_count.toLocaleString()}\n`;
        
        // Price information
        if (is_free) {
            response += `💰 **Price:** Free to Play\n`;
        } else if (price_overview) {
            response += `💰 **Price:** ${price_overview.final_formatted}`;
            if (price_overview.discount_percent > 0) {
                response += ` (${price_overview.discount_percent}% off from ${price_overview.initial_formatted})`;
            }
            response += `\n`;
        } else {
            response += `💰 **Price:** Not available\n`;
        }

        // Developers and Publishers
        if (developers.length > 0) {
            response += `👨‍💻 **Developer:** ${developers.join(', ')}\n`;
        }
        if (publishers.length > 0) {
            response += `🏢 **Publisher:** ${publishers.join(', ')}\n`;
        }

        // Genres
        if (genres.length > 0) {
            response += `🎯 **Genres:** ${genres.map((g: any) => g.description).join(', ')}\n`;
        }

        // Description
        if (short_description) {
            response += `\n📝 **Description:**\n${short_description}\n`;
        }

        // Steam Store Link
        response += `\n🔗 **Store:** https://store.steampowered.com/app/${appid}/`;

        return response;
    }
}
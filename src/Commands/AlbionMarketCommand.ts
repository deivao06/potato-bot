import { BaseCommand, CommandContext } from "./BaseCommand";
import itemsData from '../data/albion/items.json';
import axios from "axios";

enum Locale {
    PtBr = 'PT-BR'
}

enum ItemTier {
    T1 = '1',
    T2 = '2',
    T3 = '3',
    T4 = '4',
    T5 = '5',
    T6 = '6',
    T7 = '7',
    T8 = '8'
}

interface Item {
  LocalizationNameVariable: string;
  LocalizationDescriptionVariable: string;
  LocalizedNames: Record<string, string>;
  LocalizedDescriptions: Record<string, string>;
  Index: string;
  UniqueName: string;
}

type ItemPrice = {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_min_date: string
  sell_price_max: number
  sell_price_max_date: string
  buy_price_min: number
  buy_price_min_date: string
  buy_price_max: number
  buy_price_max_date: string
}

export class AlbionMarketCommand extends BaseCommand {
    name = 'albion-market';
    description = 'Get real-time market data from Albion Online';

    private apiBaseUri = 'https://west.albion-online-data.com';
    private itemImageBaseUri = 'https://render.albiononline.com/v1/item';

    private pendingSelections: Map<string, Item[]> = new Map();
    private items: Item[] = itemsData as Item[];
    private selectionRange: number = 6;

    private readonly CITIES: string[] = [
        'Martlock',
        'Caerleon',
        'Thetford',
        'Bridgewatch',
        'Fortsterling',
        'Lymhurst',
    ];

    async execute(context: CommandContext): Promise<void> {
        const { messageInfo, args, sock } = context;
        
        if (args.length === 0) {
            await sock?.sendMessage(messageInfo.key.remoteJid!, {
                text: "❌ Please provide a item name!\nExample: !albion-market Machado de Guerra"
            });
            return;
        }

        const { itemName, tier, enchantment } = this.getArgs(args);

        await sock?.sendMessage(messageInfo.key.remoteJid!, {
            text: "🔍 Searching for items..."
        });

        const itemsFiltered = this.getItemInfo(itemName, tier, enchantment);
        
        if (!itemsFiltered || itemsFiltered.length === 0) {
            await sock?.sendMessage(messageInfo.key.remoteJid!, {
                text: `❌ No items found matching "${itemName}".`
            });
            return;
        }

        if (itemsFiltered.length === 1) {
            // If only one item found, show it directly
            const itemFiltered = itemsFiltered[0];
            const itemMarketInfo = await this.getItemMarketInfo(itemFiltered);
            if (!itemMarketInfo) {
                await sock?.sendMessage(messageInfo.key.remoteJid!, {
                    text: `❌ No market data found matching "${itemName}".`
                });
                return;
            }


            const itemFullInfo = this.mountItemFullInfo(itemFiltered, itemMarketInfo);

            await this.sendItemInfo(
                itemFullInfo, 
                sock, 
                messageInfo.key.remoteJid!
            );
        } else {
            // Show selection menu for multiple items
            await this.showItemSelection(itemsFiltered, sock, messageInfo);
        }
    }

    private getItemInfo(name: string, tier?: string, enchantment?: string): Item[] | null {
        return this.items
            .filter(item => item.LocalizedNames?.[Locale.PtBr]?.toLowerCase().includes(name.toLowerCase()))
            .filter(item => !tier || item.UniqueName.match(/T\d/)?.[0]?.replace('T', '') === tier)
            .filter(item => {
                const match = item.UniqueName.match(/@(\d+)/);
                return enchantment ? match?.[1] === enchantment : !match;
            })
            .slice(0, this.selectionRange)
    }

    private async showItemSelection(itemsFiltered: Item[], sock: any, messageInfo: any): Promise<void> {
        const chatId = messageInfo.key.remoteJid!;

        let selectionText = "🪙 Found multiple items! React to select:\n\n";
        
        const emojis = ['👍', '❤️', '🙏', '😮', '😢', '😂'];
        itemsFiltered.forEach((item: Item, index) => {
            if (index < this.selectionRange) {
                selectionText += `${emojis[index]} ${this.formatItemName(item)}\n`;
            }
        });

        selectionText += "\n💡 React with the emoji to select your game!";

        const sentMessage = await sock?.sendMessage(chatId, {
            text: selectionText
        });

        // Store the items for this specific message ID
        if (sentMessage && sentMessage.key && sentMessage.key.id) {
            this.pendingSelections.set(sentMessage.key.id, itemsFiltered);
            console.log('Stored selection items for message ID:', sentMessage.key.id);
            
            // Set timeout to clear pending selection after 60 seconds
            setTimeout(() => {
                this.pendingSelections.delete(sentMessage.key.id);
                console.log('Cleared expired selection for message:', sentMessage.key.id);
            }, 60000);
        }
    }

    private formatItemName(item: Item): string {
        const tier = item.UniqueName.match(/T\d/)?.[0] ?? "";
        const level = item.UniqueName.match(/@(\d+)/)?.[1];
        const append = level ? `${tier}.${level}` : tier;

        return `${item.LocalizedNames[Locale.PtBr]} - ${append}`;
    }

    private getArgs(args: string[]): Record<string, string | null> {
        const tierEnchantmentArg = args[args.length - 1]?.toUpperCase().split('.');

        const possibleTier = tierEnchantmentArg[0]?.replace('T', '');
        const tier = Object.values(ItemTier).includes(possibleTier as ItemTier)
            ? possibleTier
            : null;

        const enchantment = tier ? tierEnchantmentArg[1] : null;
        const itemName = tier ? args.slice(0, -1).join(" ") : args.join(" ");

        return {
            itemName: itemName, 
            tier: tier, 
            enchantment: enchantment
        }
    }

    private async getItemMarketInfo(item: Item): Promise<any> {
        try {
            const response = await axios.get(`${this.apiBaseUri}/api/v2/stats/prices/${item.UniqueName}.json`, {
                params: {
                    locations: this.CITIES.join(','),
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching item market info:', error);
            return null;
        }
    }

    private groupLowestSellByCity(data: ItemPrice[]): any {
        const result: Record<string, number> = {}

        for (const item of data) {
            // Ignora se o preço é 0
            if (item.sell_price_min <= 0) continue

            // Se ainda não tem cidade registrada, ou se o valor atual é menor, atualiza
            if (
              !result[item.city] ||
              item.sell_price_min < result[item.city]
            ) {
              result[item.city] = item.sell_price_min
            }
        }

        return result
    }

    private async sendItemInfo(itemInfo: any, sock: any, chatId: string): Promise<void> {
        const response = this.mountMessageResponse(itemInfo);

        // Send image with caption if header_image is available
        if (itemInfo.Image) {
            await sock?.sendMessage(chatId, {
                image: { url: itemInfo.Image },
                caption: response
            });
        } else {
            // Fallback to text only if no image
            await sock?.sendMessage(chatId, {
                text: response
            });
        }
    }

    private mountMessageResponse(itemInfo: any): string {
        const name = this.formatItemName(itemInfo.ItemInfo);

        let response = `*${name}*\n\n`;

        for (const [city, price] of Object.entries(itemInfo.Cities)) {
            response += `*${city}:* ${Number(price).toLocaleString('pt-BR')}\n`;
        }

        return response;
    }

    private mountItemFullInfo(itemInfo: Item, itemMarketInfo: any): any {
        return {
            ItemInfo: {
                ...itemInfo,
            },
            Cities: {
                ...this.groupLowestSellByCity(itemMarketInfo),
            },
            Image: this.getImageByItemUniqueName(itemInfo.UniqueName) ?? null
        };
    }

    private getImageByItemUniqueName(uniqueName: string): string {
        return `${this.itemImageBaseUri}/${uniqueName}`;
    }
}

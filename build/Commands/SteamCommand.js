"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteamCommand = void 0;
var BaseCommand_1 = require("./BaseCommand");
var axios_1 = __importDefault(require("axios"));
var SteamCommand = /** @class */ (function (_super) {
    __extends(SteamCommand, _super);
    function SteamCommand() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'steam';
        _this.description = 'Get Steam game information including player count, price, and details';
        _this.pendingSelections = new Map();
        _this.selectionRange = 6;
        return _this;
    }
    SteamCommand.prototype.execute = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var messageInfo, args, sock, gameName, games, gameInfo, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messageInfo = context.messageInfo, args = context.args, sock = context.sock;
                        if (!(args.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(messageInfo.key.remoteJid, {
                                text: "❌ Please provide a game name!\nExample: !steam Counter-Strike 2"
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        gameName = args.join(' ');
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 13, , 15]);
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(messageInfo.key.remoteJid, {
                                text: "🔍 Searching for games..."
                            }))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.findGames(gameName)];
                    case 5:
                        games = _a.sent();
                        if (!(!games || games.length === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(messageInfo.key.remoteJid, {
                                text: "\u274C No games found matching \"".concat(gameName, "\".")
                            }))];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                    case 7:
                        if (!(games.length === 1)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.getFullGameInfo(games[0])];
                    case 8:
                        gameInfo = _a.sent();
                        return [4 /*yield*/, this.sendGameInfo(gameInfo, sock, messageInfo.key.remoteJid)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 10: 
                    // Show selection menu for multiple games
                    return [4 /*yield*/, this.showGameSelection(games, sock, messageInfo)];
                    case 11:
                        // Show selection menu for multiple games
                        _a.sent();
                        _a.label = 12;
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        error_1 = _a.sent();
                        console.error('Steam command error:', error_1);
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(messageInfo.key.remoteJid, {
                                text: "❌ Error fetching game information. Please try again later."
                            }))];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.handleReaction = function (reactionInfo, sock) {
        return __awaiter(this, void 0, void 0, function () {
            var chatId, messageId, pendingGames, reaction, selectedGameIndex, selectedGame, gameInfo, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('Steam handleReaction called with:', JSON.stringify(reactionInfo, null, 2));
                        chatId = reactionInfo.key.remoteJid;
                        messageId = reactionInfo.key.id;
                        console.log('Chat ID:', chatId);
                        console.log('Message ID:', messageId);
                        pendingGames = this.pendingSelections.get(messageId);
                        console.log('Pending games for message:', pendingGames);
                        if (!pendingGames) {
                            console.log('No pending games found for this message');
                            return [2 /*return*/];
                        }
                        reaction = (_a = reactionInfo.reaction) === null || _a === void 0 ? void 0 : _a.text;
                        console.log('Reaction emoji:', reaction);
                        selectedGameIndex = -1;
                        // Map reactions to game indices
                        switch (reaction) {
                            case '👍':
                                selectedGameIndex = 0;
                                break;
                            case '❤️':
                                selectedGameIndex = 1;
                                break;
                            case '🙏':
                                selectedGameIndex = 2;
                                break;
                            case '😮':
                                selectedGameIndex = 3;
                                break;
                            case '😢':
                                selectedGameIndex = 4;
                                break;
                            case '😂':
                                selectedGameIndex = 5;
                                break;
                            default:
                                console.log('Unknown reaction emoji:', reaction);
                                return [2 /*return*/];
                        }
                        console.log('Selected game index:', selectedGameIndex);
                        if (!(selectedGameIndex < pendingGames.length)) return [3 /*break*/, 7];
                        selectedGame = pendingGames[selectedGameIndex];
                        console.log('Selected game:', selectedGame);
                        // Clean up tracking for this message
                        this.pendingSelections.delete(messageId);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this.getFullGameInfo(selectedGame)];
                    case 2:
                        gameInfo = _b.sent();
                        return [4 /*yield*/, this.sendGameInfo(gameInfo, sock, chatId)];
                    case 3:
                        _b.sent();
                        console.log('Game info sent successfully');
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _b.sent();
                        console.error('Error getting selected game info:', error_2);
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(chatId, {
                                text: "❌ Error getting game information."
                            }))];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        console.log('Selected index out of range');
                        _b.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.findGames = function (gameName) {
        return __awaiter(this, void 0, void 0, function () {
            var gamesResponse, games, matchingGames, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/')];
                    case 1:
                        gamesResponse = _a.sent();
                        games = gamesResponse.data.applist.apps;
                        matchingGames = games.filter(function (g) {
                            return g.name.toLowerCase().includes(gameName.toLowerCase());
                        }).slice(0, this.selectionRange);
                        return [2 /*return*/, matchingGames.length > 0 ? matchingGames : null];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error fetching games:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.getFullGameInfo = function (game) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gameDetails, playerCount, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.getGameDetails(game.appid),
                                this.getPlayerCount(game.appid)
                            ])];
                    case 1:
                        _a = _b.sent(), gameDetails = _a[0], playerCount = _a[1];
                        return [2 /*return*/, __assign(__assign({}, gameDetails), { player_count: playerCount, appid: game.appid })];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error fetching game info:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.showGameSelection = function (games, sock, messageInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var chatId, selectionText, emojis, sentMessage;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chatId = messageInfo.key.remoteJid;
                        selectionText = "🎮 Found multiple games! React to select:\n\n";
                        emojis = ['👍', '❤️', '🙏', '😮', '😢', '😂'];
                        games.forEach(function (game, index) {
                            if (index < _this.selectionRange) {
                                selectionText += "".concat(emojis[index], " ").concat(game.name, "\n");
                            }
                        });
                        selectionText += "\n💡 React with the emoji to select your game!";
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(chatId, {
                                text: selectionText
                            }))];
                    case 1:
                        sentMessage = _a.sent();
                        // Store the games for this specific message ID
                        if (sentMessage && sentMessage.key && sentMessage.key.id) {
                            this.pendingSelections.set(sentMessage.key.id, games);
                            console.log('Stored selection games for message ID:', sentMessage.key.id);
                            // Set timeout to clear pending selection after 60 seconds
                            setTimeout(function () {
                                _this.pendingSelections.delete(sentMessage.key.id);
                                console.log('Cleared expired selection for message:', sentMessage.key.id);
                            }, 60000);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.sendGameInfo = function (gameInfo, sock, chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = this.formatGameInfo(gameInfo);
                        if (!gameInfo.header_image) return [3 /*break*/, 2];
                        return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(chatId, {
                                image: { url: gameInfo.header_image },
                                caption: response
                            }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: 
                    // Fallback to text only if no image
                    return [4 /*yield*/, (sock === null || sock === void 0 ? void 0 : sock.sendMessage(chatId, {
                            text: response
                        }))];
                    case 3:
                        // Fallback to text only if no image
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.getGameDetails = function (appId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, gameData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("https://store.steampowered.com/api/appdetails?appids=".concat(appId))];
                    case 1:
                        response = _a.sent();
                        gameData = response.data[appId];
                        if (gameData && gameData.success) {
                            return [2 /*return*/, gameData.data];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error fetching game details:', error_5);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.getPlayerCount = function (appId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=".concat(appId))];
                    case 1:
                        response = _a.sent();
                        data = response.data.response;
                        return [2 /*return*/, data.player_count || 0];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error fetching player count:', error_6);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SteamCommand.prototype.formatGameInfo = function (gameInfo) {
        var name = gameInfo.name, appid = gameInfo.appid, is_free = gameInfo.is_free, short_description = gameInfo.short_description, _a = gameInfo.developers, developers = _a === void 0 ? [] : _a, _b = gameInfo.publishers, publishers = _b === void 0 ? [] : _b, price_overview = gameInfo.price_overview, _c = gameInfo.categories, categories = _c === void 0 ? [] : _c, _d = gameInfo.genres, genres = _d === void 0 ? [] : _d, player_count = gameInfo.player_count, header_image = gameInfo.header_image;
        var response = "\uD83C\uDFAE **".concat(name, "**\n\n");
        response += "\uD83D\uDCF1 **App ID:** ".concat(appid, "\n");
        response += "\uD83D\uDC65 **Current Players:** ".concat(player_count.toLocaleString(), "\n");
        // Price information
        if (is_free) {
            response += "\uD83D\uDCB0 **Price:** Free to Play\n";
        }
        else if (price_overview) {
            response += "\uD83D\uDCB0 **Price:** ".concat(price_overview.final_formatted);
            if (price_overview.discount_percent > 0) {
                response += " (".concat(price_overview.discount_percent, "% off from ").concat(price_overview.initial_formatted, ")");
            }
            response += "\n";
        }
        else {
            response += "\uD83D\uDCB0 **Price:** Not available\n";
        }
        // Developers and Publishers
        if (developers.length > 0) {
            response += "\uD83D\uDC68\u200D\uD83D\uDCBB **Developer:** ".concat(developers.join(', '), "\n");
        }
        if (publishers.length > 0) {
            response += "\uD83C\uDFE2 **Publisher:** ".concat(publishers.join(', '), "\n");
        }
        // Genres
        if (genres.length > 0) {
            response += "\uD83C\uDFAF **Genres:** ".concat(genres.map(function (g) { return g.description; }).join(', '), "\n");
        }
        // Description
        if (short_description) {
            response += "\n\uD83D\uDCDD **Description:**\n".concat(short_description, "\n");
        }
        // Steam Store Link
        response += "\n\uD83D\uDD17 **Store:** https://store.steampowered.com/app/".concat(appid, "/");
        return response;
    };
    return SteamCommand;
}(BaseCommand_1.BaseCommand));
exports.SteamCommand = SteamCommand;

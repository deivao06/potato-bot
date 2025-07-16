"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var baileys_1 = __importStar(require("baileys"));
var pino_1 = __importDefault(require("pino"));
var qrcode_1 = __importDefault(require("qrcode"));
var CommandRegistry_1 = require("../Commands/CommandRegistry");
var dashboard_server_1 = require("../api/dashboard-server");
// Claude, don't insert specific command rules here, keep specific command rules for the specific rule.
var PotatoBot = /** @class */ (function () {
    function PotatoBot() {
        var _this = this;
        this.groupMetadataCache = new Map();
        this.pendingSelections = new Map();
        this.connectionUpdate = function (update) { return __awaiter(_this, void 0, void 0, function () {
            var connection, lastDisconnect, qr, _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                        // Update dashboard with connection status
                        if (connection === 'open') {
                            dashboard_server_1.dashboardServer.updateBotStatus({
                                connectionStatus: 'connected',
                                isRunning: true
                            });
                        }
                        else if (connection === 'close') {
                            dashboard_server_1.dashboardServer.updateBotStatus({
                                connectionStatus: 'disconnected',
                                isRunning: false
                            });
                        }
                        else if (connection === 'connecting') {
                            dashboard_server_1.dashboardServer.updateBotStatus({
                                connectionStatus: 'connecting',
                                isRunning: true
                            });
                        }
                        if (!(connection === 'close'
                            && ((_d = (_c = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _c === void 0 ? void 0 : _c.output) === null || _d === void 0 ? void 0 : _d.statusCode) === baileys_1.DisconnectReason.restartRequired)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.restartConnection()];
                    case 1:
                        _e.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!qr) return [3 /*break*/, 4];
                        _b = (_a = console).log;
                        return [4 /*yield*/, qrcode_1.default.toString(qr, { type: 'terminal', small: true })];
                    case 3:
                        _b.apply(_a, [_e.sent()]);
                        _e.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.messagesUpsert = function (_a) {
            var _b;
            var type = _a.type, messages = _a.messages;
            if (type == "notify") { // new messages
                for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                    var messageInfo = messages_1[_i];
                    var messageText = (_b = messageInfo.message) === null || _b === void 0 ? void 0 : _b.conversation;
                    if (messageText && _this.isCommand(messageText)) {
                        _this.handleCommand(messageText, messageInfo);
                    }
                }
            }
        };
        this.handleReaction = function (reactions) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_1, this_1, _i, reactions_1, reaction;
            var _this = this;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        console.log('=== REACTION EVENT TRIGGERED ===');
                        console.log('Reaction event received:', JSON.stringify(reactions, null, 2));
                        _loop_1 = function (reaction) {
                            var reactionMessageId, pendingSelection, remoteJid, senderPhone, isGroup, chatType, chatName, formattedPhone, originalMessage, botMessage_1, command, sockWithLogging;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        console.log('Processing reaction:', JSON.stringify(reaction, null, 2));
                                        if (!((_a = reaction.reaction) === null || _a === void 0 ? void 0 : _a.text)) return [3 /*break*/, 4];
                                        reactionMessageId = (_b = reaction.key) === null || _b === void 0 ? void 0 : _b.id;
                                        // Check if this reaction is for a pending selection
                                        if (!reactionMessageId || !this_1.pendingSelections.has(reactionMessageId)) {
                                            console.log('⏭️  Ignoring reaction - not for a pending selection');
                                            return [2 /*return*/, "continue"];
                                        }
                                        pendingSelection = this_1.pendingSelections.get(reactionMessageId);
                                        console.log('✅ Found pending selection:', pendingSelection);
                                        remoteJid = ((_c = reaction.key) === null || _c === void 0 ? void 0 : _c.remoteJid) || 'unknown';
                                        senderPhone = ((_d = reaction.key) === null || _d === void 0 ? void 0 : _d.participant) || ((_e = reaction.key) === null || _e === void 0 ? void 0 : _e.fromMe) ? 'bot' : 'unknown';
                                        isGroup = remoteJid.includes('@g.us');
                                        chatType = isGroup ? 'group' : 'private';
                                        chatName = 'Unknown';
                                        if (!isGroup) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this_1.getGroupName(remoteJid)];
                                    case 1:
                                        chatName = _h.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        // For private chats, use sender's name if available, otherwise show phone number
                                        if (reaction.pushName) {
                                            chatName = "".concat(reaction.pushName, " (Private)");
                                        }
                                        else {
                                            formattedPhone = senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', '');
                                            chatName = "".concat(formattedPhone, " (Private)");
                                        }
                                        _h.label = 3;
                                    case 3:
                                        originalMessage = dashboard_server_1.dashboardServer.getMessageById(((_f = reaction.key) === null || _f === void 0 ? void 0 : _f.id) || '');
                                        botMessage_1 = {
                                            id: "reaction_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                                            groupId: remoteJid,
                                            groupName: chatName,
                                            messageText: "Reacted with ".concat(reaction.reaction.text),
                                            command: 'reaction',
                                            timestamp: new Date(),
                                            isReaction: true,
                                            reactionEmoji: reaction.reaction.text,
                                            senderPhone: senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', ''),
                                            senderName: reaction.pushName || 'Unknown',
                                            chatType: chatType,
                                            reactionToMessageId: originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.id,
                                            reactionToMessageText: originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.messageText,
                                            reactionToCommand: pendingSelection.commandName
                                        };
                                        dashboard_server_1.dashboardServer.addBotMessage(botMessage_1);
                                        command = this_1.commandRegistry.getCommand(pendingSelection.commandName);
                                        if (command && 'handleReaction' in command) {
                                            console.log("Calling ".concat(pendingSelection.commandName, " command handleReaction"));
                                            sockWithLogging = __assign(__assign({}, this_1.sock), { sendMessage: function (jid, content) { return __awaiter(_this, void 0, void 0, function () {
                                                    var response, imageUrl;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                response = content.text || content.caption || JSON.stringify(content);
                                                                if (content.image && content.image.url) {
                                                                    imageUrl = content.image.url;
                                                                }
                                                                dashboard_server_1.dashboardServer.updateBotResponse(botMessage_1.id, response, imageUrl);
                                                                return [4 /*yield*/, this.sock.sendMessage(jid, content)];
                                                            case 1: 
                                                            // Send the actual message
                                                            return [2 /*return*/, _a.sent()];
                                                        }
                                                    });
                                                }); } });
                                            command.handleReaction(reaction, sockWithLogging);
                                            // Remove from pending selections after processing
                                            this_1.pendingSelections.delete(reactionMessageId);
                                            console.log('🗑️  Removed processed pending selection');
                                        }
                                        else {
                                            console.log("Command ".concat(pendingSelection.commandName, " not found or no handleReaction method"));
                                        }
                                        return [3 /*break*/, 5];
                                    case 4:
                                        console.log('No reactionMessage found in reaction');
                                        _h.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, reactions_1 = reactions;
                        _g.label = 1;
                    case 1:
                        if (!(_i < reactions_1.length)) return [3 /*break*/, 4];
                        reaction = reactions_1[_i];
                        return [5 /*yield**/, _loop_1(reaction)];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.prefixes = ['!', '-'];
        this.commandRegistry = new CommandRegistry_1.CommandRegistry();
        this.initializeBot();
        // Initialize dashboard server
        dashboard_server_1.dashboardServer.setBotInstance(this);
        dashboard_server_1.dashboardServer.start();
        // Clear group metadata cache every 30 minutes to prevent memory issues
        setInterval(function () {
            _this.groupMetadataCache.clear();
            console.log('Group metadata cache cleared');
        }, 30 * 60 * 1000);
        // Clear expired pending selections every 5 minutes
        setInterval(function () {
            _this.clearExpiredPendingSelections();
        }, 5 * 60 * 1000);
    }
    PotatoBot.prototype.initializeBot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.commandRegistry.loadCommands()];
                    case 1:
                        _a.sent();
                        console.log("Loaded ".concat(this.commandRegistry.getCommandNames().length, " commands: ").concat(this.commandRegistry.getCommandNames().join(', ')));
                        this.startSock().then(function () {
                            _this.sock.ev.on('connection.update', _this.connectionUpdate);
                            _this.sock.ev.on('messages.upsert', _this.messagesUpsert);
                            _this.sock.ev.on('messages.reaction', _this.handleReaction);
                            _this.sock.ev.on("creds.update", _this.saveCreds);
                            console.log('Event listeners set up successfully');
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    PotatoBot.prototype.startSock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, state, saveCreds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, baileys_1.useMultiFileAuthState)("auth_info_baileys")];
                    case 1:
                        _a = _b.sent(), state = _a.state, saveCreds = _a.saveCreds;
                        this.saveCreds = saveCreds;
                        this.sock = (0, baileys_1.default)({
                            auth: state,
                            logger: (0, pino_1.default)(),
                            shouldSyncHistoryMessage: function () { return false; }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    PotatoBot.prototype.restartConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.startSock().then(function () {
                    _this.sock.ev.on('connection.update', _this.connectionUpdate);
                    _this.sock.ev.on('messages.upsert', _this.messagesUpsert);
                    _this.sock.ev.on('messages.reaction', _this.handleReaction);
                    _this.sock.ev.on("creds.update", _this.saveCreds);
                });
                return [2 /*return*/];
            });
        });
    };
    PotatoBot.prototype.isCommand = function (messageText) {
        return this.prefixes.some(function (prefix) { return messageText.startsWith(prefix); });
    };
    /**
     * Add a message to pending selections (when a command sends interactive message)
     */
    PotatoBot.prototype.addPendingSelection = function (messageId, commandName, chatId) {
        this.pendingSelections.set(messageId, {
            commandName: commandName,
            timestamp: new Date(),
            chatId: chatId
        });
        console.log("\uD83D\uDCDD Added pending selection: ".concat(messageId, " for command: ").concat(commandName));
    };
    /**
     * Remove a pending selection
     */
    PotatoBot.prototype.removePendingSelection = function (messageId) {
        if (this.pendingSelections.delete(messageId)) {
            console.log("\uD83D\uDDD1\uFE0F  Removed pending selection: ".concat(messageId));
        }
    };
    /**
     * Clear expired pending selections (older than 10 minutes)
     */
    PotatoBot.prototype.clearExpiredPendingSelections = function () {
        var _this = this;
        var now = new Date();
        var expiredThreshold = 10 * 60 * 1000; // 10 minutes
        this.pendingSelections.forEach(function (selection, messageId) {
            if (now.getTime() - selection.timestamp.getTime() > expiredThreshold) {
                _this.pendingSelections.delete(messageId);
                console.log("\u23F0 Expired pending selection: ".concat(messageId, " for command: ").concat(selection.commandName));
            }
        });
    };
    PotatoBot.prototype.getGroupName = function (jid) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, metadata, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Check cache first
                        if (this.groupMetadataCache.has(jid)) {
                            cached = this.groupMetadataCache.get(jid);
                            return [2 /*return*/, cached.subject || 'Unknown Group'];
                        }
                        return [4 /*yield*/, this.sock.groupMetadata(jid)];
                    case 1:
                        metadata = _a.sent();
                        // Cache the result
                        this.groupMetadataCache.set(jid, metadata);
                        return [2 /*return*/, metadata.subject || 'Unknown Group'];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching group metadata:', error_1);
                        return [2 /*return*/, 'Unknown Group'];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PotatoBot.prototype.handleCommand = function (messageText, messageInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var usedPrefix, commandWithArgs, _a, commandName, args, command, remoteJid_1, senderPhone, isGroup, chatType, chatName, formattedPhone, botMessage_2, sockWithLogging;
            var _this = this;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        usedPrefix = this.prefixes.find(function (prefix) { return messageText.startsWith(prefix); });
                        if (!usedPrefix)
                            return [2 /*return*/];
                        commandWithArgs = messageText.slice(usedPrefix.length).trim();
                        _a = commandWithArgs.split(' '), commandName = _a[0], args = _a.slice(1);
                        command = this.commandRegistry.getCommand(commandName.toLowerCase());
                        if (!command) return [3 /*break*/, 5];
                        remoteJid_1 = ((_b = messageInfo.key) === null || _b === void 0 ? void 0 : _b.remoteJid) || 'unknown';
                        senderPhone = ((_c = messageInfo.key) === null || _c === void 0 ? void 0 : _c.participant) || ((_d = messageInfo.key) === null || _d === void 0 ? void 0 : _d.remoteJid) || 'unknown';
                        isGroup = remoteJid_1.includes('@g.us');
                        chatType = isGroup ? 'group' : 'private';
                        chatName = 'Unknown';
                        if (!isGroup) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getGroupName(remoteJid_1)];
                    case 1:
                        chatName = _f.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        // For private chats, use sender's name if available, otherwise show phone number
                        if (messageInfo.pushName) {
                            chatName = "".concat(messageInfo.pushName, " (Private)");
                        }
                        else {
                            formattedPhone = senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', '');
                            chatName = "".concat(formattedPhone, " (Private)");
                        }
                        _f.label = 3;
                    case 3:
                        botMessage_2 = {
                            id: ((_e = messageInfo.key) === null || _e === void 0 ? void 0 : _e.id) || Date.now().toString(),
                            groupId: remoteJid_1,
                            groupName: chatName,
                            messageText: messageText,
                            command: commandName,
                            timestamp: new Date(messageInfo.messageTimestamp * 1000),
                            isReaction: false,
                            senderPhone: senderPhone.replace('@s.whatsapp.net', '').replace('@c.us', ''),
                            senderName: messageInfo.pushName,
                            chatType: chatType
                        };
                        dashboard_server_1.dashboardServer.addBotMessage(botMessage_2);
                        sockWithLogging = __assign(__assign({}, this.sock), { sendMessage: function (jid, content) { return __awaiter(_this, void 0, void 0, function () {
                                var response, imageUrl, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            response = content.text || content.caption || JSON.stringify(content);
                                            if (content.image && content.image.url) {
                                                imageUrl = content.image.url;
                                            }
                                            dashboard_server_1.dashboardServer.updateBotResponse(botMessage_2.id, response, imageUrl);
                                            return [4 /*yield*/, this.sock.sendMessage(jid, content)];
                                        case 1:
                                            result = _a.sent();
                                            // Only add to pending selections if message contains selection indicators
                                            if (result && result.key && result.key.id && response.includes('React')) {
                                                this.addPendingSelection(result.key.id, commandName, remoteJid_1);
                                            }
                                            return [2 /*return*/, result];
                                    }
                                });
                            }); } });
                        return [4 /*yield*/, command.execute({
                                messageInfo: messageInfo,
                                args: args,
                                sock: sockWithLogging,
                                bot: this
                            })];
                    case 4:
                        _f.sent();
                        _f.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return PotatoBot;
}());
exports.default = PotatoBot;

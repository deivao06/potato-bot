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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardServer = exports.DashboardServer = void 0;
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var DashboardServer = /** @class */ (function () {
    function DashboardServer() {
        this.botMessages = [];
        this.botGroups = new Map();
        this.botInstance = null;
        this.messageCache = new Map(); // Cache for reaction lookup
        this.botStatus = {
            isRunning: false,
            connectionStatus: 'disconnected',
            lastUpdate: new Date(),
            commandCount: 0,
            groupCount: 0
        };
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    DashboardServer.prototype.setupMiddleware = function () {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    };
    DashboardServer.prototype.setupRoutes = function () {
        var _this = this;
        // Get bot status
        this.app.get('/api/status', function (req, res) {
            res.json(_this.botStatus);
        });
        // Get bot messages
        this.app.get('/api/messages', function (req, res) {
            var limit = parseInt(req.query.limit) || 100;
            var messages = _this.botMessages
                .slice(-limit)
                .sort(function (a, b) { return b.timestamp.getTime() - a.timestamp.getTime(); });
            res.json(messages);
        });
        // Get bot chats (groups and private chats)
        this.app.get('/api/groups', function (req, res) {
            var groups = Array.from(_this.botGroups.values());
            res.json(groups);
        });
        // Get messages for specific chat (group or private)
        this.app.get('/api/groups/:groupId/messages', function (req, res) {
            var groupId = req.params.groupId;
            var limit = parseInt(req.query.limit) || 50;
            var messages = _this.botMessages
                .filter(function (msg) { return msg.groupId === groupId; })
                .slice(-limit)
                .sort(function (a, b) { return b.timestamp.getTime() - a.timestamp.getTime(); });
            res.json(messages);
        });
    };
    DashboardServer.prototype.setBotInstance = function (bot) {
        this.botInstance = bot;
        this.botStatus.isRunning = true;
        this.botStatus.lastUpdate = new Date();
    };
    DashboardServer.prototype.updateBotStatus = function (status) {
        this.botStatus = __assign(__assign(__assign({}, this.botStatus), status), { lastUpdate: new Date() });
    };
    DashboardServer.prototype.addBotMessage = function (message) {
        this.botMessages.push(message);
        // Cache message for reaction lookup
        if (!message.isReaction) {
            this.messageCache.set(message.id, message);
        }
        // Update group info
        if (!this.botGroups.has(message.groupId)) {
            this.botGroups.set(message.groupId, {
                id: message.groupId,
                name: message.groupName,
                messageCount: 0,
                lastActivity: new Date(),
                chatType: message.chatType
            });
        }
        var group = this.botGroups.get(message.groupId);
        group.messageCount++;
        group.lastActivity = new Date();
        // Update bot status
        this.botStatus.commandCount++;
        this.botStatus.groupCount = this.botGroups.size;
        this.botStatus.lastUpdate = new Date();
    };
    DashboardServer.prototype.getMessageById = function (messageId) {
        return this.messageCache.get(messageId);
    };
    DashboardServer.prototype.updateBotResponse = function (messageId, response, imageUrl) {
        // Update in cache
        var cachedMessage = this.messageCache.get(messageId);
        if (cachedMessage) {
            cachedMessage.botResponse = response;
            cachedMessage.botResponseTimestamp = new Date();
            if (imageUrl) {
                cachedMessage.botResponseImage = imageUrl;
            }
        }
        // Update in messages array
        var message = this.botMessages.find(function (msg) { return msg.id === messageId; });
        if (message) {
            message.botResponse = response;
            message.botResponseTimestamp = new Date();
            if (imageUrl) {
                message.botResponseImage = imageUrl;
            }
        }
    };
    DashboardServer.prototype.start = function (port) {
        if (port === void 0) { port = 3001; }
        this.app.listen(port, function () {
            console.log("Dashboard server running on port ".concat(port));
        });
    };
    return DashboardServer;
}());
exports.DashboardServer = DashboardServer;
exports.dashboardServer = new DashboardServer();

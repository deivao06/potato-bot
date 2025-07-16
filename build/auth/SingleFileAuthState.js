"use strict";
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
exports.SingleFileAuthState = void 0;
exports.useSingleFileAuthState = useSingleFileAuthState;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var SingleFileAuthState = /** @class */ (function () {
    function SingleFileAuthState(filePath) {
        if (filePath === void 0) { filePath = './auth_state.json'; }
        this.filePath = path_1.default.resolve(filePath);
        this.authData = this.createEmptyAuthData();
    }
    SingleFileAuthState.prototype.createEmptyAuthData = function () {
        return {
            creds: {
                noiseKey: undefined,
                pairingEphemeralKeyPair: undefined,
                signedIdentityKey: undefined,
                signedPreKey: undefined,
                registrationId: undefined,
                advSecretKey: undefined,
                processedHistoryMessages: [],
                nextPreKeyId: 1,
                firstUnuploadedPreKeyId: 1,
                accountSyncCounter: 0,
                accountSettings: undefined,
                deviceId: undefined,
                phoneId: undefined,
                identityId: undefined,
                registered: false,
                backupToken: undefined,
                registration: undefined,
                pairingCode: undefined,
                lastAccountSyncTimestamp: undefined,
                myAppStateKeyId: undefined,
                platform: undefined
            },
            keys: {
                'pre-key': {},
                'session': {},
                'sender-key': {},
                'app-state-sync-key': {},
                'app-state-sync-version': {},
                'sender-key-memory': {}
            }
        };
    };
    /**
     * Load authentication state from file
     */
    SingleFileAuthState.prototype.loadAuthState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exists, data, parsed, error_1, authState;
            var _this = this;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fs_1.promises.access(this.filePath).then(function () { return true; }).catch(function () { return false; })];
                    case 1:
                        exists = _g.sent();
                        if (!exists) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs_1.promises.readFile(this.filePath, 'utf-8')];
                    case 2:
                        data = _g.sent();
                        parsed = JSON.parse(data);
                        // Validate and merge with default structure
                        this.authData = {
                            creds: parsed.creds || {},
                            keys: {
                                'pre-key': ((_a = parsed.keys) === null || _a === void 0 ? void 0 : _a['pre-key']) || {},
                                'session': ((_b = parsed.keys) === null || _b === void 0 ? void 0 : _b['session']) || {},
                                'sender-key': ((_c = parsed.keys) === null || _c === void 0 ? void 0 : _c['sender-key']) || {},
                                'app-state-sync-key': ((_d = parsed.keys) === null || _d === void 0 ? void 0 : _d['app-state-sync-key']) || {},
                                'app-state-sync-version': ((_e = parsed.keys) === null || _e === void 0 ? void 0 : _e['app-state-sync-version']) || {},
                                'sender-key-memory': ((_f = parsed.keys) === null || _f === void 0 ? void 0 : _f['sender-key-memory']) || {}
                            }
                        };
                        console.log('✅ Loaded existing auth state from', this.filePath);
                        return [3 /*break*/, 4];
                    case 3:
                        console.log('📝 No existing auth state found, creating new one');
                        this.authData = this.createEmptyAuthData();
                        _g.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _g.sent();
                        console.error('❌ Error loading auth state:', error_1);
                        console.log('📝 Creating fresh auth state');
                        this.authData = this.createEmptyAuthData();
                        return [3 /*break*/, 6];
                    case 6:
                        authState = {
                            creds: this.authData.creds,
                            keys: {
                                get: function (type, ids) { return __awaiter(_this, void 0, void 0, function () {
                                    var key, data, result, _i, ids_1, id;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        key = type;
                                        data = this.authData.keys[key] || {};
                                        if (Array.isArray(ids)) {
                                            result = {};
                                            for (_i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                                                id = ids_1[_i];
                                                if (data[id]) {
                                                    result[id] = data[id];
                                                }
                                            }
                                            return [2 /*return*/, result];
                                        }
                                        else {
                                            return [2 /*return*/, data[ids] ? (_a = {}, _a[ids] = data[ids], _a) : {}];
                                        }
                                        return [2 /*return*/];
                                    });
                                }); },
                                set: function (data) { return __awaiter(_this, void 0, void 0, function () {
                                    var category, key, items, id, value;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                for (category in data) {
                                                    key = category;
                                                    items = data[key];
                                                    if (!this.authData.keys[key]) {
                                                        this.authData.keys[key] = {};
                                                    }
                                                    for (id in items) {
                                                        value = items[id];
                                                        if (value === null || value === undefined) {
                                                            delete this.authData.keys[key][id];
                                                        }
                                                        else {
                                                            this.authData.keys[key][id] = value;
                                                        }
                                                    }
                                                }
                                                // Auto-save after each set operation
                                                return [4 /*yield*/, this.saveAuthState()];
                                            case 1:
                                                // Auto-save after each set operation
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }
                            }
                        };
                        // Update creds reference when it changes
                        Object.defineProperty(authState, 'creds', {
                            get: function () { return _this.authData.creds; },
                            set: function (newCreds) {
                                _this.authData.creds = newCreds;
                                _this.saveAuthState();
                            }
                        });
                        return [2 /*return*/, authState];
                }
            });
        });
    };
    /**
     * Save authentication state to file
     */
    SingleFileAuthState.prototype.saveAuthState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dir, tempPath, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        dir = path_1.default.dirname(this.filePath);
                        return [4 /*yield*/, fs_1.promises.mkdir(dir, { recursive: true })];
                    case 1:
                        _a.sent();
                        tempPath = "".concat(this.filePath, ".tmp");
                        return [4 /*yield*/, fs_1.promises.writeFile(tempPath, JSON.stringify(this.authData, null, 2), 'utf-8')];
                    case 2:
                        _a.sent();
                        // Atomic rename
                        return [4 /*yield*/, fs_1.promises.rename(tempPath, this.filePath)];
                    case 3:
                        // Atomic rename
                        _a.sent();
                        console.log('💾 Auth state saved');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('❌ Error saving auth state:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update credentials
     */
    SingleFileAuthState.prototype.updateCreds = function (creds) {
        this.authData.creds = creds;
    };
    /**
     * Get save credentials function for Baileys
     */
    SingleFileAuthState.prototype.getSaveCredsFunction = function () {
        var _this = this;
        return function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saveAuthState()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
    };
    /**
     * Clear auth state (for logout)
     */
    SingleFileAuthState.prototype.clearAuthState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs_1.promises.unlink(this.filePath)];
                    case 1:
                        _a.sent();
                        console.log('🗑️  Auth state cleared');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ Error clearing auth state:', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SingleFileAuthState;
}());
exports.SingleFileAuthState = SingleFileAuthState;
/**
 * Create single file auth state - replacement for useMultiFileAuthState
 */
function useSingleFileAuthState(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var authState, state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authState = new SingleFileAuthState(filePath);
                    return [4 /*yield*/, authState.loadAuthState()];
                case 1:
                    state = _a.sent();
                    return [2 /*return*/, {
                            state: state,
                            saveCreds: authState.getSaveCredsFunction(),
                            clearAuth: function () { return authState.clearAuthState(); }
                        }];
            }
        });
    });
}

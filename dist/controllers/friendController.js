"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePlaytimeSummary = exports.getSharedGames = exports.compareGameAchievements = exports.compareGamePlaytime = exports.getFriendsWithDetails = exports.getFriendList = void 0;
const friendService = __importStar(require("../services/friendService"));
const steamService = __importStar(require("../services/steamService"));
require('dotenv').config(); // Not needed for Railway, but useful locally
// Get friend list
const getFriendList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let steamId = req.params.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the ID or username if it's provided and not the default
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = yield steamService.resolveSteamID(steamId);
            }
            catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: error.message
                });
                return;
            }
        }
        const friendList = yield friendService.getFriendList(steamId);
        res.json(friendList);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFriendList = getFriendList;
// Get friends with profiles
const getFriendsWithDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let steamId = req.params.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the ID or username if it's provided and not the default
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = yield steamService.resolveSteamID(steamId);
            }
            catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: error.message
                });
                return;
            }
        }
        const friendDetails = yield friendService.getFriendsWithDetails(steamId);
        res.json(friendDetails);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFriendsWithDetails = getFriendsWithDetails;
// Compare game playtime with a friend
const compareGamePlaytime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { friendId, appId } = req.params;
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the user's ID or username
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = yield steamService.resolveSteamID(steamId);
            }
            catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: error.message
                });
                return;
            }
        }
        // Resolve the friend's ID or username
        try {
            friendId = yield steamService.resolveSteamID(friendId);
        }
        catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: error.message
            });
            return;
        }
        const comparisonData = yield friendService.compareGamePlaytime(steamId, friendId, appId);
        res.json(comparisonData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.compareGamePlaytime = compareGamePlaytime;
// Compare game achievements with a friend
const compareGameAchievements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { friendId, appId } = req.params;
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the user's ID or username
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = yield steamService.resolveSteamID(steamId);
            }
            catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: error.message
                });
                return;
            }
        }
        // Resolve the friend's ID or username
        try {
            friendId = yield steamService.resolveSteamID(friendId);
        }
        catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: error.message
            });
            return;
        }
        const comparisonData = yield friendService.compareGameAchievements(steamId, friendId, appId);
        res.json(comparisonData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.compareGameAchievements = compareGameAchievements;
// Get shared games with a friend
const getSharedGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { friendId } = req.params;
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the user's ID or username
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = yield steamService.resolveSteamID(steamId);
            }
            catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: error.message
                });
                return;
            }
        }
        // Resolve the friend's ID or username
        try {
            friendId = yield steamService.resolveSteamID(friendId);
        }
        catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: error.message
            });
            return;
        }
        const sharedGames = yield friendService.getSharedGames(steamId, friendId);
        res.json(sharedGames);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getSharedGames = getSharedGames;
// Compare playtime summary with a friend
const comparePlaytimeSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { friendId } = req.params;
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the user's ID or username
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = yield steamService.resolveSteamID(steamId);
            }
            catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: error.message
                });
                return;
            }
        }
        // Resolve the friend's ID or username
        try {
            friendId = yield steamService.resolveSteamID(friendId);
        }
        catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: error.message
            });
            return;
        }
        const comparisonData = yield friendService.comparePlaytimeSummary(steamId, friendId);
        res.json(comparisonData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.comparePlaytimeSummary = comparePlaytimeSummary;
//# sourceMappingURL=friendController.js.map
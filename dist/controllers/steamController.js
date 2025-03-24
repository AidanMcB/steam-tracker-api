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
exports.getMultipleUserSummaries = exports.searchUsers = exports.getUserStats = exports.getMyStats = exports.getRecentGames = exports.getPlaytimeSummary = exports.getGameAchievements = exports.getGamePlaytime = exports.getAppDetails = exports.getOwnedGames = exports.getUserProfile = void 0;
const steamService = __importStar(require("../services/steamService"));
require('dotenv').config(); // Not needed for Railway, but useful locally
// Search for users by username
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        if (!query) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }
        const searchResults = yield steamService.searchUsers(query, limit);
        res.json({ results: searchResults });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.searchUsers = searchUsers;
// Get user profile by ID or username
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamId } = req.params;
        // First, resolve the ID or username to a Steam ID
        let resolvedId;
        try {
            resolvedId = yield steamService.resolveSteamID(steamId);
        }
        catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the ID or username "${steamId}"`,
                details: error.message
            });
            return;
        }
        const userData = yield steamService.getUserSummary(resolvedId);
        res.json(userData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUserProfile = getUserProfile;
// Get owned games by ID or username
const getOwnedGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamId } = req.params;
        // First, resolve the ID or username to a Steam ID
        let resolvedId;
        try {
            resolvedId = yield steamService.resolveSteamID(steamId);
        }
        catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the ID or username "${steamId}"`,
                details: error.message
            });
            return;
        }
        const gamesData = yield steamService.getUserOwnedGames(resolvedId);
        res.json(gamesData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getOwnedGames = getOwnedGames;
// Get app details
const getAppDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appId } = req.params;
        const appData = yield steamService.getAppDetails(appId);
        res.json(appData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAppDetails = getAppDetails;
// Get game playtime
const getGamePlaytime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appId } = req.params;
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the ID or username if it's provided
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
        const playtimeData = yield steamService.getGamePlaytime(steamId, appId);
        res.json(playtimeData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getGamePlaytime = getGamePlaytime;
// Get game achievements
const getGameAchievements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appId } = req.params;
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the ID or username if it's provided
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
        const achievementData = yield steamService.getGameAchievements(steamId, appId);
        res.json(achievementData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getGameAchievements = getGameAchievements;
// get multiple user summaries
const getMultipleUserSummaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamIds } = req.query;
        let idList = [];
        // Handle comma-separated string format: steamIds=123,456,789
        if (typeof steamIds === 'string') {
            idList = steamIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
        }
        // Handle array format: steamIds[]=123&steamIds[]=456
        else if (Array.isArray(steamIds)) {
            idList = steamIds.map(id => String(id));
        }
        if (idList.length === 0) {
            res.status(400).json({ error: 'At least one Steam ID must be provided as steamIds=id1,id2,id3 or steamIds[]=id1&steamIds[]=id2' });
            return;
        }
        // Resolve each ID or username to a Steam ID if needed
        const resolvedIds = [];
        for (const id of idList) {
            try {
                const resolvedId = yield steamService.resolveSteamID(id);
                resolvedIds.push(resolvedId);
            }
            catch (error) {
                // Log the error but continue with other IDs
                console.error(`Failed to resolve Steam ID: ${id}`, error);
            }
        }
        if (resolvedIds.length === 0) {
            res.status(404).json({ error: 'Could not resolve any of the provided Steam IDs or usernames' });
            return;
        }
        // Fetch individual user summaries if the batch function doesn't exist
        const userSummaries = yield Promise.all(resolvedIds.map(id => steamService.getUserSummary(id)));
        res.json({ users: userSummaries });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getMultipleUserSummaries = getMultipleUserSummaries;
// Get playtime summary
const getPlaytimeSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the ID or username if it's provided
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
        const playtimeSummary = yield steamService.getPlaytimeSummary(steamId);
        res.json(playtimeSummary);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPlaytimeSummary = getPlaytimeSummary;
// Get recently played games
const getRecentGames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;
        const count = req.query.count ? parseInt(req.query.count, 10) : 5;
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        // Resolve the ID or username if it's provided
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
        const recentGames = yield steamService.getRecentPlayedGames(steamId, count);
        res.json(recentGames);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRecentGames = getRecentGames;
// Get my Steam stats (comprehensive endpoint)
const getMyStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const steamId = process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'HM_STEAM_ID not set in environment variables' });
            return;
        }
        const userProfile = yield steamService.getUserSummary(steamId);
        const playtimeSummary = yield steamService.getPlaytimeSummary(steamId);
        const recentGames = yield steamService.getRecentPlayedGames(steamId);
        res.json({
            profile: userProfile,
            playtime_summary: playtimeSummary,
            recent_games: recentGames
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getMyStats = getMyStats;
// Get my Steam stats (comprehensive endpoint)
const getUserStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { steamId } = req.params;
        if (!steamId) {
            res.status(400).json({ error: 'No steam id sent' });
            return;
        }
        const userProfile = yield steamService.getUserSummary(steamId);
        const playtimeSummary = yield steamService.getPlaytimeSummary(steamId);
        const recentGames = yield steamService.getRecentPlayedGames(steamId);
        res.json({
            profile: userProfile,
            playtime_summary: playtimeSummary,
            recent_games: recentGames
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUserStats = getUserStats;
//# sourceMappingURL=steamController.js.map
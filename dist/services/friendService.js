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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriendList = getFriendList;
exports.getFriendsWithDetails = getFriendsWithDetails;
exports.compareGamePlaytime = compareGamePlaytime;
exports.compareGameAchievements = compareGameAchievements;
exports.getSharedGames = getSharedGames;
exports.comparePlaytimeSummary = comparePlaytimeSummary;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const steamService = __importStar(require("./steamService"));
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
// Steam API configuration
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const HM_STEAM_ID = process.env.HM_STEAM_ID || '76561198401526411';
/**
 * Get a user's friend list
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<SteamFriend[] | ErrorResponse>} List of friends
 */
function getFriendList(steamId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.steampowered.com/ISteamUser/GetFriendList/v1/', {
                params: {
                    key: STEAM_API_KEY,
                    steamid: steamId,
                    relationship: 'friend', // 'all', 'friend'
                },
            });
            return response.data.friendslist.friends;
        }
        catch (error) {
            // Handle case where profile is private
            if (error.response && error.response.status === 401) {
                return {
                    error: 'This profile is private or the API key does not have access to this profile',
                    steam_id: steamId,
                };
            }
            console.error('Error fetching friend list:', error.message);
            throw error;
        }
    });
}
/**
 * Get detailed information about a user's friends
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<FriendWithDetails[] | ErrorResponse>} List of friends with detailed profiles
 */
function getFriendsWithDetails(steamId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const friendList = yield getFriendList(steamId);
            // If we got an error response, return it
            if ('error' in friendList) {
                return friendList;
            }
            // Get detailed profile information for each friend
            const friendDetails = [];
            // Use Promise.all to fetch all friend profiles in parallel
            const friendProfiles = yield Promise.all(friendList.map((friend) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const profile = yield steamService.getUserSummary(friend.steamid);
                    return Object.assign(Object.assign({}, friend), { profile });
                }
                catch (error) {
                    console.error(`Error fetching profile for friend ${friend.steamid}:`, error.message);
                    // Return the friend without profile data if there was an error
                    return friend;
                }
            })));
            return friendProfiles;
        }
        catch (error) {
            console.error('Error fetching friends with details:', error.message);
            throw error;
        }
    });
}
/**
 * Compare playtime for a game between two users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @param {string} appId - App ID of the game to compare
 * @returns {Promise<GameComparison>} Comparison data
 */
function compareGamePlaytime(steamId1, steamId2, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get playtime data for both users
            const user1Data = yield steamService.getGamePlaytime(steamId1, appId);
            const user2Data = yield steamService.getGamePlaytime(steamId2, appId);
            // Calculate difference
            const difference = user1Data.playtime.total_hours - user2Data.playtime.total_hours;
            const diffPercentage = user1Data.playtime.total_hours > 0
                ? ((Math.abs(difference) / user1Data.playtime.total_hours) * 100).toFixed(2) + '%'
                : 'N/A';
            return {
                appid: user1Data.appid,
                name: user1Data.name,
                user1: {
                    steamid: steamId1,
                    playtime_hours: user1Data.playtime.total_hours,
                },
                user2: {
                    steamid: steamId2,
                    playtime_hours: user2Data.playtime.total_hours,
                },
                difference,
                difference_percentage: diffPercentage,
            };
        }
        catch (error) {
            // Handle case where one user doesn't own the game
            if (error.message && error.message.includes('not found in user')) {
                return {
                    error: `One or both users do not own this game or playtime data is unavailable`,
                    details: error.message,
                };
            }
            console.error('Error comparing game playtime:', error.message);
            throw error;
        }
    });
}
/**
 * Compare achievements for a game between two users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @param {string} appId - App ID of the game to compare
 * @returns {Promise<AchievementComparison | ErrorResponse>} Comparison data
 */
function compareGameAchievements(steamId1, steamId2, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get achievement data for both users
            const user1Data = yield steamService.getGameAchievements(steamId1, appId);
            const user2Data = yield steamService.getGameAchievements(steamId2, appId);
            // Check if either user has an error response
            if ('error' in user1Data || 'error' in user2Data) {
                return {
                    error: 'One or both users do not have achievement data available for this game',
                    details: 'error' in user1Data
                        ? user1Data.error
                        : 'error' in user2Data
                            ? user2Data.error
                            : 'Unknown error',
                };
            }
            // Calculate difference and percentages
            const difference = user1Data.unlocked_achievements - user2Data.unlocked_achievements;
            const user1Percentage = ((user1Data.unlocked_achievements / user1Data.total_achievements) * 100).toFixed(2) + '%';
            const user2Percentage = ((user2Data.unlocked_achievements / user2Data.total_achievements) * 100).toFixed(2) + '%';
            const diffPercentage = ((Math.abs(difference) / user1Data.total_achievements) * 100).toFixed(2) + '%';
            return {
                game_name: user1Data.game_name,
                total_achievements: user1Data.total_achievements,
                user1: {
                    steamid: steamId1,
                    unlocked_achievements: user1Data.unlocked_achievements,
                    percentage: user1Percentage,
                },
                user2: {
                    steamid: steamId2,
                    unlocked_achievements: user2Data.unlocked_achievements,
                    percentage: user2Percentage,
                },
                difference,
                difference_percentage: diffPercentage,
            };
        }
        catch (error) {
            console.error('Error comparing game achievements:', error.message);
            throw error;
        }
    });
}
/**
 * Get games owned by both users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @returns {Promise<SharedGames | ErrorResponse>} List of shared games with playtime data
 */
function getSharedGames(steamId1, steamId2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get owned games for both users
            const user1Games = yield steamService.getUserOwnedGames(steamId1);
            const user2Games = yield steamService.getUserOwnedGames(steamId2);
            if (!user1Games.games || !user2Games.games) {
                return {
                    error: 'Game data unavailable for one or both users',
                    details: 'One or both user profiles may be private',
                };
            }
            // Find games that both users own
            const sharedGames = user1Games.games.filter((game1) => user2Games.games.some((game2) => game1.appid === game2.appid));
            // Enrich with data from user2
            const enrichedSharedGames = sharedGames.map((game) => {
                const user2Game = user2Games.games.find((g) => g.appid === game.appid);
                return {
                    appid: game.appid,
                    name: game.name,
                    user1_playtime: (game.playtime_forever / 60).toFixed(2),
                    user2_playtime: user2Game ? (user2Game.playtime_forever / 60).toFixed(2) : '0.00',
                };
            });
            // Sort by total combined playtime
            enrichedSharedGames.sort((a, b) => {
                const totalA = parseFloat(a.user1_playtime) + parseFloat(a.user2_playtime);
                const totalB = parseFloat(b.user1_playtime) + parseFloat(b.user2_playtime);
                return totalB - totalA;
            });
            return {
                shared_count: sharedGames.length,
                total_user1: user1Games.game_count,
                total_user2: user2Games.game_count,
                shared_games: enrichedSharedGames,
            };
        }
        catch (error) {
            console.error('Error getting shared games:', error.message);
            throw error;
        }
    });
}
/**
 * Compare playtime statistics between two users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @returns {Promise<PlaytimeComparison | ErrorResponse>} Playtime comparison data
 */
function comparePlaytimeSummary(steamId1, steamId2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get playtime summaries for both users
            const user1Summary = yield steamService.getPlaytimeSummary(steamId1);
            const user2Summary = yield steamService.getPlaytimeSummary(steamId2);
            // Get shared games for top game comparison
            const sharedGamesResult = yield getSharedGames(steamId1, steamId2);
            if ('error' in sharedGamesResult) {
                return {
                    error: 'Unable to compare playtime',
                    details: sharedGamesResult.error,
                };
            }
            // Get top 5 shared games with highest combined playtime
            const topGames = sharedGamesResult.shared_games.slice(0, 5);
            // Transform to proper comparison format
            const topGamesComparison = topGames.map(game => {
                const user1Hours = parseFloat(game.user1_playtime);
                const user2Hours = parseFloat(game.user2_playtime);
                const difference = user1Hours - user2Hours;
                const diffPercentage = user1Hours > 0
                    ? ((Math.abs(difference) / user1Hours) * 100).toFixed(2) + '%'
                    : 'N/A';
                return {
                    appid: game.appid,
                    name: game.name,
                    user1: {
                        steamid: steamId1,
                        playtime_hours: user1Hours,
                    },
                    user2: {
                        steamid: steamId2,
                        playtime_hours: user2Hours,
                    },
                    difference,
                    difference_percentage: diffPercentage,
                };
            });
            return {
                user1: {
                    steamid: steamId1,
                    total_games: user1Summary.total_games,
                    total_playtime_hours: user1Summary.total_playtime_hours,
                    average_playtime_hours: user1Summary.average_playtime_hours,
                },
                user2: {
                    steamid: steamId2,
                    total_games: user2Summary.total_games,
                    total_playtime_hours: user2Summary.total_playtime_hours,
                    average_playtime_hours: user2Summary.average_playtime_hours,
                },
                difference: {
                    total_games: user1Summary.total_games - user2Summary.total_games,
                    total_playtime_hours: user1Summary.total_playtime_hours - user2Summary.total_playtime_hours,
                    average_playtime_hours: user1Summary.average_playtime_hours - user2Summary.average_playtime_hours,
                },
                top_games_comparison: topGamesComparison,
            };
        }
        catch (error) {
            console.error('Error comparing playtime summaries:', error.message);
            throw error;
        }
    });
}
//# sourceMappingURL=friendService.js.map
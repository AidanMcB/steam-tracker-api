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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSummary = getUserSummary;
exports.getUserOwnedGames = getUserOwnedGames;
exports.getAppDetails = getAppDetails;
exports.getGamePlaytime = getGamePlaytime;
exports.getRecentPlayedGames = getRecentPlayedGames;
exports.getGameAchievements = getGameAchievements;
exports.getPlaytimeSummary = getPlaytimeSummary;
exports.resolveVanityURL = resolveVanityURL;
exports.resolveSteamID = resolveSteamID;
exports.searchUsers = searchUsers;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
// Steam API configuration
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const HM_STEAM_ID = process.env.HM_STEAM_ID || '76561198401526411';
// Check if the API key is set
if (!STEAM_API_KEY) {
    console.error('STEAM_API_KEY is not set in .env.local file');
    console.error('Please create a .env.local file with your Steam API key');
    console.error('Example: STEAM_API_KEY=your_api_key_here');
}
/**
 * Resolve a Steam username (vanity URL) to a Steam ID
 * @param {string} username - Steam username/vanity URL
 * @returns {Promise<string>} Steam ID
 */
function resolveVanityURL(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {
                params: {
                    key: STEAM_API_KEY,
                    vanityurl: username,
                },
            });
            const result = response.data.response;
            if (result.success === 1) {
                return result.steamid;
            }
            else {
                throw new Error(`Could not resolve username "${username}" to Steam ID. ${result.message || ''}`);
            }
        }
        catch (error) {
            console.error('Error resolving vanity URL:', error.message);
            throw error;
        }
    });
}
/**
 * Check if a string is a valid Steam ID or username and return the Steam ID
 * @param {string} idOrUsername - Steam ID or username
 * @returns {Promise<string>} Steam ID
 */
function resolveSteamID(idOrUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        // Simple regex to check if the string is likely a Steam ID (17-digit number)
        const steamIDRegex = /^[0-9]{17}$/;
        if (steamIDRegex.test(idOrUsername)) {
            return idOrUsername; // It's already a Steam ID
        }
        else {
            // It's a username, resolve it to a Steam ID
            return resolveVanityURL(idOrUsername);
        }
    });
}
/**
 * Get a user's profile information
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<SteamUser>} User profile data
 */
function getUserSummary(steamId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
                params: {
                    key: STEAM_API_KEY,
                    steamids: steamId,
                },
            });
            return response.data.response.players[0];
        }
        catch (error) {
            console.error('Error fetching user summary:', error.message);
            throw error;
        }
    });
}
/**
 * Get a user's owned games
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<SteamOwnedGames>} List of owned games and data
 */
function getUserOwnedGames(steamId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
                params: {
                    key: STEAM_API_KEY,
                    steamid: steamId,
                    include_appinfo: true,
                    include_played_free_games: true,
                },
            });
            return response.data.response;
        }
        catch (error) {
            console.error('Error fetching owned games:', error.message);
            throw error;
        }
    });
}
/**
 * Get details for a specific game (app)
 * @param {string} appId - App ID for the game
 * @returns {Promise<SteamAppDetails>} Game details
 */
function getAppDetails(appId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Note: This endpoint doesn't require an API key
            const response = yield axios_1.default.get('https://store.steampowered.com/api/appdetails', {
                params: {
                    appids: appId,
                },
            });
            return response.data[appId];
        }
        catch (error) {
            console.error('Error fetching app details:', error.message);
            throw error;
        }
    });
}
/**
 * Get playtime data for a specific game
 * @param {string} steamId - Steam ID of the user
 * @param {string} appId - App ID for the game
 * @returns {Promise<GamePlaytime>} Game playtime data
 */
function getGamePlaytime(steamId, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ownedGames = yield getUserOwnedGames(steamId);
            const game = ownedGames.games.find((game) => game.appid.toString() === appId);
            if (!game) {
                throw new Error(`Game with appID ${appId} not found in user's library`);
            }
            // Convert minutes to hours and round to 2 decimal places
            const totalPlaytime = (game.playtime_forever / 60).toFixed(2);
            const recentPlaytime = game.playtime_2weeks ? (game.playtime_2weeks / 60).toFixed(2) : 0;
            return {
                appid: game.appid,
                name: game.name,
                img_icon_url: game.img_icon_url,
                img_logo_url: game.img_logo_url,
                playtime: {
                    total_hours: parseFloat(totalPlaytime),
                    recent_hours: parseFloat(recentPlaytime.toString()),
                    last_played: game.rtime_last_played
                        ? new Date(game.rtime_last_played * 1000).toISOString()
                        : null,
                },
            };
        }
        catch (error) {
            console.error('Error fetching game playtime:', error.message);
            throw error;
        }
    });
}
/**
 * Get recent activity for all games
 * @param {string} steamId - Steam ID of the user
 * @param {number} count - Number of recent games to return
 * @returns {Promise<Array>} Recent games data
 */
function getRecentPlayedGames(steamId_1) {
    return __awaiter(this, arguments, void 0, function* (steamId, count = 5) {
        try {
            const response = yield axios_1.default.get('https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/', {
                params: {
                    key: STEAM_API_KEY,
                    steamid: steamId,
                    count: count,
                },
            });
            // Transform the data to include hours instead of minutes
            const games = response.data.response.games || [];
            return games.map((game) => ({
                appid: game.appid,
                name: game.name,
                icon_url: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
                logo_url: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`,
                playtime: {
                    total_hours: (game.playtime_forever / 60).toFixed(2),
                    recent_hours: (game.playtime_2weeks / 60).toFixed(2),
                },
            }));
        }
        catch (error) {
            console.error('Error fetching recent played games:', error.message);
            throw error;
        }
    });
}
/**
 * Get user achievement stats for a specific game
 * @param {string} steamId - Steam ID of the user
 * @param {string} appId - App ID for the game
 * @returns {Promise<GameAchievements | ErrorResponse>} Achievement data
 */
function getGameAchievements(steamId, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/', {
                params: {
                    key: STEAM_API_KEY,
                    steamid: steamId,
                    appid: appId,
                },
            });
            if (!response.data.playerstats.success) {
                throw new Error('Failed to retrieve achievements or game has no achievements');
            }
            // Sort achievements by unlock time to show gaming activity over time
            const achievements = response.data.playerstats.achievements;
            const unlockedAchievements = achievements
                .filter((achievement) => achievement.achieved === 1)
                .map((achievement) => ({
                name: achievement.name,
                unlock_time: new Date(achievement.unlocktime * 1000).toISOString(),
            }))
                .sort((a, b) => new Date(a.unlock_time).getTime() - new Date(b.unlock_time).getTime());
            // Calculate achievement activity by month and year
            const activityByMonth = {};
            const activityByYear = {};
            unlockedAchievements.forEach((achievement) => {
                const date = new Date(achievement.unlock_time);
                const month = `${date.getFullYear()}-${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}`;
                const year = date.getFullYear().toString();
                activityByMonth[month] = (activityByMonth[month] || 0) + 1;
                activityByYear[year] = (activityByYear[year] || 0) + 1;
            });
            return {
                game_name: response.data.playerstats.gameName,
                total_achievements: achievements.length,
                unlocked_achievements: unlockedAchievements.length,
                activity_by_month: activityByMonth,
                activity_by_year: activityByYear,
                achievement_history: unlockedAchievements,
            };
        }
        catch (error) {
            // Handle case where game has no achievements or isn't owned
            if (error.response && error.response.status === 400) {
                return {
                    error: 'No achievement data available for this game or user',
                    game_id: appId,
                    steam_id: steamId,
                };
            }
            console.error('Error fetching game achievements:', error.message);
            throw error;
        }
    });
}
/**
 * Get a playtime summary for all games
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<PlaytimeSummary>} Playtime summary data
 */
function getPlaytimeSummary(steamId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ownedGames = yield getUserOwnedGames(steamId);
            if (!ownedGames.games || ownedGames.games.length === 0) {
                throw new Error('No games found for this user');
            }
            // Sort games by playtime (descending)
            const sortedGames = [...ownedGames.games].sort((a, b) => b.playtime_forever - a.playtime_forever);
            // Calculate total playtime across all games
            const totalPlaytimeMinutes = sortedGames.reduce((total, game) => total + game.playtime_forever, 0);
            const totalPlaytimeHours = (totalPlaytimeMinutes / 60).toFixed(2);
            // Get top 10 most played games
            const topGames = sortedGames.slice(0, 10).map((game) => ({
                appid: game.appid,
                name: game.name,
                playtime_hours: parseFloat((game.playtime_forever / 60).toFixed(2)),
                percentage: ((game.playtime_forever / totalPlaytimeMinutes) * 100).toFixed(2) + '%',
                img_icon_url: game.img_icon_url,
                img_logo_url: game.img_logo_url,
            }));
            return {
                total_games: ownedGames.game_count,
                total_playtime_hours: parseFloat(totalPlaytimeHours),
                average_playtime_hours: parseFloat((totalPlaytimeMinutes / 60 / ownedGames.game_count).toFixed(2)),
                top_games: topGames,
                games_with_playtime: sortedGames.filter((game) => game.playtime_forever > 0).length,
                games_never_played: sortedGames.filter((game) => game.playtime_forever === 0).length,
            };
        }
        catch (error) {
            console.error('Error creating playtime summary:', error.message);
            throw error;
        }
    });
}
/**
 * Search for users by username (partial match)
 * This function scrapes the Steam Community search page as there is no official API for this
 * @param {string} searchTerm - Username to search for
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {Promise<Array<{steamId: string, personaName: string, avatarUrl: string}>>} List of matching users
 */
function searchUsers(searchTerm_1) {
    return __awaiter(this, arguments, void 0, function* (searchTerm, limit = 10) {
        try {
            console.log('Searching for users:', searchTerm);
            // First try to resolve the exact username
            try {
                const exactId = yield resolveVanityURL(searchTerm);
                const userData = yield getUserSummary(exactId);
                // Return the exact match as the first result
                return [{
                        steamId: exactId,
                        personaName: userData.personaname,
                        avatarUrl: userData.avatar
                    }];
            }
            catch (error) {
                // If it fails, continue with the search
                console.log(`No exact match for "${searchTerm}", trying search...`);
            }
            // Since there is no official API for searching users, we need to scrape the Steam Community search page
            // Warning: This is an unofficial approach and may break if Steam changes their website
            const response = yield axios_1.default.get('https://steamcommunity.com/search/SearchCommunityAjax', {
                params: {
                    text: searchTerm,
                    filter: 'users',
                    sessionid: 'steamcommunity', // This is a dummy session ID, may not always work
                    page: 1
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Referer': 'https://steamcommunity.com/search/users/'
                }
            });
            let results = [];
            // Parse the response based on Steam's format
            // This might need adjustments based on the actual response format
            if (response.data && response.data.html) {
                // Use regex to extract user information from the HTML response
                const userPattern = /<a class="searchPersonaName" href="https:\/\/steamcommunity\.com\/id\/([^"]+)|\/profiles\/([^"]+)"[^>]*>([^<]+)<\/a>.*?<img src="([^"]+)"/g;
                let match;
                while ((match = userPattern.exec(response.data.html)) !== null && results.length < limit) {
                    // Extract steamId from the URL (either /id/ or /profiles/)
                    let steamId = match[2] || ''; // If it's a /profiles/ URL
                    if (!steamId && match[1]) {
                        // If it's an /id/ URL, we need to resolve the vanity URL
                        try {
                            steamId = yield resolveVanityURL(match[1]);
                        }
                        catch (error) {
                            console.error(`Error resolving vanity URL for ${match[1]}:`, error.message);
                            continue;
                        }
                    }
                    results.push({
                        steamId,
                        personaName: match[3] || '',
                        avatarUrl: match[4] || ''
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error('Error searching for users:', error.message);
            throw new Error(`Failed to search for users matching "${searchTerm}": ${error.message}`);
        }
    });
}
//# sourceMappingURL=steamService.js.map
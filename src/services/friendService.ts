import axios from 'axios';
import dotenv from 'dotenv';
import * as steamService from './steamService';
import {
    SteamFriend,
    FriendWithDetails,
    GameComparison,
    AchievementComparison,
    SharedGames,
    PlaytimeComparison,
    SteamUser,
    ErrorResponse
} from '../types/steam';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}
  
// Steam API configuration
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const HM_STEAM_ID = process.env.HM_STEAM_ID || '76561198401526411';

/**
 * Get a user's friend list
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<SteamFriend[] | ErrorResponse>} List of friends
 */
async function getFriendList(steamId: string): Promise<SteamFriend[] | ErrorResponse> {
    try {
        const response = await axios.get(
            'https://api.steampowered.com/ISteamUser/GetFriendList/v1/',
            {
                params: {
                    key: STEAM_API_KEY,
                    steamid: steamId,
                    relationship: 'friend', // 'all', 'friend'
                },
            }
        );

        return response.data.friendslist.friends;
    } catch (error: any) {
        // Handle case where profile is private
        if (error.response && error.response.status === 401) {
            return {
                error: 'This profile is private or the API key does not have access to this profile',
                steam_id: steamId,
            };
        }
        console.error('Error fetching friend list:', (error as Error).message);
        throw error;
    }
}

/**
 * Get detailed information about a user's friends
 * @param {string} steamId - Steam ID of the user
 * @returns {Promise<FriendWithDetails[] | ErrorResponse>} List of friends with detailed profiles
 */
async function getFriendsWithDetails(steamId: string): Promise<FriendWithDetails[] | ErrorResponse> {
    try {
        const friendList = await getFriendList(steamId);

        // If we got an error response, return it
        if ('error' in friendList) {
            return friendList;
        }

        // Get detailed profile information for each friend
        const friendDetails: FriendWithDetails[] = [];
        
        // Use Promise.all to fetch all friend profiles in parallel
        const friendProfiles = await Promise.all(
            friendList.map(async (friend) => {
                try {
                    const profile = await steamService.getUserSummary(friend.steamid);
                    return {
                        ...friend,
                        profile,
                    };
                } catch (error) {
                    console.error(`Error fetching profile for friend ${friend.steamid}:`, (error as Error).message);
                    // Return the friend without profile data if there was an error
                    return friend;
                }
            })
        );

        return friendProfiles;
    } catch (error) {
        console.error('Error fetching friends with details:', (error as Error).message);
        throw error;
    }
}

/**
 * Compare playtime for a game between two users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @param {string} appId - App ID of the game to compare
 * @returns {Promise<GameComparison>} Comparison data
 */
async function compareGamePlaytime(steamId1: string, steamId2: string, appId: string): Promise<GameComparison | ErrorResponse> {
    try {
        // Get playtime data for both users
        const user1Data = await steamService.getGamePlaytime(steamId1, appId);
        const user2Data = await steamService.getGamePlaytime(steamId2, appId);

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
    } catch (error: any) {
        // Handle case where one user doesn't own the game
        if (error.message && error.message.includes('not found in user')) {
            return {
                error: `One or both users do not own this game or playtime data is unavailable`,
                details: error.message,
            };
        }
        console.error('Error comparing game playtime:', (error as Error).message);
        throw error;
    }
}

/**
 * Compare achievements for a game between two users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @param {string} appId - App ID of the game to compare
 * @returns {Promise<AchievementComparison | ErrorResponse>} Comparison data
 */
async function compareGameAchievements(steamId1: string, steamId2: string, appId: string): Promise<AchievementComparison | ErrorResponse> {
    try {
        // Get achievement data for both users
        const user1Data = await steamService.getGameAchievements(steamId1, appId);
        const user2Data = await steamService.getGameAchievements(steamId2, appId);

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
    } catch (error) {
        console.error('Error comparing game achievements:', (error as Error).message);
        throw error;
    }
}

/**
 * Get games owned by both users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @returns {Promise<SharedGames | ErrorResponse>} List of shared games with playtime data
 */
async function getSharedGames(steamId1: string, steamId2: string): Promise<SharedGames | ErrorResponse> {
    try {
        // Get owned games for both users
        const user1Games = await steamService.getUserOwnedGames(steamId1);
        const user2Games = await steamService.getUserOwnedGames(steamId2);

        if (!user1Games.games || !user2Games.games) {
            return {
                error: 'Game data unavailable for one or both users',
                details: 'One or both user profiles may be private',
            };
        }

        // Find games that both users own
        const sharedGames = user1Games.games.filter((game1) => 
            user2Games.games.some((game2) => game1.appid === game2.appid)
        );

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
    } catch (error) {
        console.error('Error getting shared games:', (error as Error).message);
        throw error;
    }
}

/**
 * Compare playtime statistics between two users
 * @param {string} steamId1 - Steam ID of the first user
 * @param {string} steamId2 - Steam ID of the second user (friend)
 * @returns {Promise<PlaytimeComparison | ErrorResponse>} Playtime comparison data
 */
async function comparePlaytimeSummary(steamId1: string, steamId2: string): Promise<PlaytimeComparison | ErrorResponse> {
    try {
        // Get playtime summaries for both users
        const user1Summary = await steamService.getPlaytimeSummary(steamId1);
        const user2Summary = await steamService.getPlaytimeSummary(steamId2);

        // Get shared games for top game comparison
        const sharedGamesResult = await getSharedGames(steamId1, steamId2);
        
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
    } catch (error) {
        console.error('Error comparing playtime summaries:', (error as Error).message);
        throw error;
    }
}

export {
    getFriendList,
    getFriendsWithDetails,
    compareGamePlaytime,
    compareGameAchievements,
    getSharedGames,
    comparePlaytimeSummary
}; 
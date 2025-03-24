import { Response } from 'express';
import * as friendService from '../services/friendService';
import * as steamService from '../services/steamService';
import {
    RequestWithParams,
    RequestWithQuery,
    RequestWithParamsAndQuery,
    SteamIdParam,
    FriendIdParam,
    FriendAndAppIdParams,
    SteamIdQuery
} from '../types/express';

// Get friend list
const getFriendList = async (req: RequestWithParams<SteamIdParam>, res: Response): Promise<void> => {
    try {
        let steamId = req.params.steamId || process.env.HM_STEAM_ID;
        
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        
        // Resolve the ID or username if it's provided and not the default
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({ 
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }
        
        const friendList = await friendService.getFriendList(steamId);
        res.json(friendList);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get friends with profiles
const getFriendsWithDetails = async (req: RequestWithParams<SteamIdParam>, res: Response): Promise<void> => {
    try {
        let steamId = req.params.steamId || process.env.HM_STEAM_ID;
        
        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }
        
        // Resolve the ID or username if it's provided and not the default
        if (steamId && steamId !== process.env.HM_STEAM_ID) {
            try {
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({ 
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }
        
        const friendDetails = await friendService.getFriendsWithDetails(steamId);
        res.json(friendDetails);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Compare game playtime with a friend
const compareGamePlaytime = async (req: RequestWithParamsAndQuery<FriendAndAppIdParams, SteamIdQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({ 
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }
        
        // Resolve the friend's ID or username
        try {
            friendId = await steamService.resolveSteamID(friendId);
        } catch (error) {
            res.status(404).json({ 
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: (error as Error).message
            });
            return;
        }
        
        const comparisonData = await friendService.compareGamePlaytime(steamId, friendId, appId);
        res.json(comparisonData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Compare game achievements with a friend
const compareGameAchievements = async (req: RequestWithParamsAndQuery<FriendAndAppIdParams, SteamIdQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({ 
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }
        
        // Resolve the friend's ID or username
        try {
            friendId = await steamService.resolveSteamID(friendId);
        } catch (error) {
            res.status(404).json({ 
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: (error as Error).message
            });
            return;
        }
        
        const comparisonData = await friendService.compareGameAchievements(steamId, friendId, appId);
        res.json(comparisonData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get shared games with a friend
const getSharedGames = async (req: RequestWithParamsAndQuery<FriendIdParam, SteamIdQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({ 
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }
        
        // Resolve the friend's ID or username
        try {
            friendId = await steamService.resolveSteamID(friendId);
        } catch (error) {
            res.status(404).json({ 
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: (error as Error).message
            });
            return;
        }
        
        const sharedGames = await friendService.getSharedGames(steamId, friendId);
        res.json(sharedGames);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Compare playtime summary with a friend
const comparePlaytimeSummary = async (req: RequestWithParamsAndQuery<FriendIdParam, SteamIdQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({ 
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }
        
        // Resolve the friend's ID or username
        try {
            friendId = await steamService.resolveSteamID(friendId);
        } catch (error) {
            res.status(404).json({ 
                error: `Could not find a Steam user with the friend ID or username provided`,
                details: (error as Error).message
            });
            return;
        }
        
        const comparisonData = await friendService.comparePlaytimeSummary(steamId, friendId);
        res.json(comparisonData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export {
    getFriendList,
    getFriendsWithDetails,
    compareGamePlaytime,
    compareGameAchievements,
    getSharedGames,
    comparePlaytimeSummary
}; 
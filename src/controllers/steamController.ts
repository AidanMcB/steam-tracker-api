import { Request, Response } from 'express';
import * as steamService from '../services/steamService';
import {
    RequestWithParams,
    RequestWithQuery,
    RequestWithParamsAndQuery,
    SteamIdParam,
    AppIdParam,
    SteamIdQuery,
    CountQuery
} from '../types/express';

// Search for users by username
const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

        if (!query) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        const searchResults = await steamService.searchUsers(query as string, limit);
        res.json({ results: searchResults });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get user profile by ID or username
const getUserProfile = async (req: RequestWithParams<SteamIdParam>, res: Response): Promise<void> => {
    try {
        const { steamId } = req.params;

        // First, resolve the ID or username to a Steam ID
        let resolvedId: string;
        try {
            resolvedId = await steamService.resolveSteamID(steamId);
        } catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the ID or username "${steamId}"`,
                details: (error as Error).message
            });
            return;
        }

        const userData = await steamService.getUserSummary(resolvedId);
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get owned games by ID or username
const getOwnedGames = async (req: RequestWithParams<SteamIdParam>, res: Response): Promise<void> => {
    try {
        const { steamId } = req.params;

        // First, resolve the ID or username to a Steam ID
        let resolvedId: string;
        try {
            resolvedId = await steamService.resolveSteamID(steamId);
        } catch (error) {
            res.status(404).json({
                error: `Could not find a Steam user with the ID or username "${steamId}"`,
                details: (error as Error).message
            });
            return;
        }

        const gamesData = await steamService.getUserOwnedGames(resolvedId);
        res.json(gamesData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get app details
const getAppDetails = async (req: RequestWithParams<AppIdParam>, res: Response): Promise<void> => {
    try {
        const { appId } = req.params;
        const appData = await steamService.getAppDetails(appId);
        res.json(appData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get game playtime
const getGamePlaytime = async (req: RequestWithParamsAndQuery<AppIdParam, SteamIdQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }

        const playtimeData = await steamService.getGamePlaytime(steamId, appId);
        res.json(playtimeData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get game achievements
const getGameAchievements = async (req: RequestWithParamsAndQuery<AppIdParam, SteamIdQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }

        const achievementData = await steamService.getGameAchievements(steamId, appId);
        res.json(achievementData);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// get multiple user summaries
const getMultipleUserSummaries = async (req: RequestWithQuery<SteamIdQuery>, res: Response): Promise<void> => {
    try {
        const { steamIds } = req.query;

        let idList: string[] = [];

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
        const resolvedIds: string[] = [];
        for (const id of idList) {
            try {
                const resolvedId = await steamService.resolveSteamID(id);
                resolvedIds.push(resolvedId);
            } catch (error) {
                // Log the error but continue with other IDs
                console.error(`Failed to resolve Steam ID: ${id}`, error);
            }
        }

        if (resolvedIds.length === 0) {
            res.status(404).json({ error: 'Could not resolve any of the provided Steam IDs or usernames' });
            return;
        }

        // Fetch individual user summaries if the batch function doesn't exist
        const userSummaries = await Promise.all(
            resolvedIds.map(id => steamService.getUserSummary(id))
        );

        res.json({ users: userSummaries });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get playtime summary
const getPlaytimeSummary = async (req: RequestWithQuery<SteamIdQuery>, res: Response): Promise<void> => {
    try {
        let steamId = req.query.steamId || process.env.HM_STEAM_ID;

        if (!steamId) {
            res.status(400).json({ error: 'No Steam ID provided' });
            return;
        }

        // Resolve the ID or username if it's provided
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

        const playtimeSummary = await steamService.getPlaytimeSummary(steamId);
        res.json(playtimeSummary);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get recently played games
const getRecentGames = async (req: RequestWithQuery<SteamIdQuery & CountQuery>, res: Response): Promise<void> => {
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
                steamId = await steamService.resolveSteamID(steamId);
            } catch (error) {
                res.status(404).json({
                    error: `Could not find a Steam user with the ID or username provided`,
                    details: (error as Error).message
                });
                return;
            }
        }

        const recentGames = await steamService.getRecentPlayedGames(steamId, count);
        res.json(recentGames);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get my Steam stats (comprehensive endpoint)
const getMyStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const steamId = process.env.HM_STEAM_ID;
        if (!steamId) {
            res.status(400).json({ error: 'HM_STEAM_ID not set in environment variables' });
            return;
        }

        const userProfile = await steamService.getUserSummary(steamId);
        const playtimeSummary = await steamService.getPlaytimeSummary(steamId);
        const recentGames = await steamService.getRecentPlayedGames(steamId);

        res.json({
            profile: userProfile,
            playtime_summary: playtimeSummary,
            recent_games: recentGames
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

// Get my Steam stats (comprehensive endpoint)
const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { steamId } = req.params;
        if (!steamId) {
            res.status(400).json({ error: 'No steam id sent' });
            return;
        }

        const userProfile = await steamService.getUserSummary(steamId);
        const playtimeSummary = await steamService.getPlaytimeSummary(steamId);
        const recentGames = await steamService.getRecentPlayedGames(steamId);

        res.json({
            profile: userProfile,
            playtime_summary: playtimeSummary,
            recent_games: recentGames
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export {
    getUserProfile,
    getOwnedGames,
    getAppDetails,
    getGamePlaytime,
    getGameAchievements,
    getPlaytimeSummary,
    getRecentGames,
    getMyStats,
    getUserStats,
    searchUsers,
    getMultipleUserSummaries
}; 
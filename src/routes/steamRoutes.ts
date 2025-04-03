import express from 'express';
import * as steamController from '../controllers/steamController';

const router = express.Router();

// User search route
router.get('/search/users', steamController.searchUsers);

// Steam user profile routes
router.get('/user/:steamId', steamController.getUserProfile);
router.get('/users', steamController.getMultipleUserSummaries);
router.get('/games/:steamId', steamController.getOwnedGames);
router.get('/app/:appId', steamController.getAppDetails);

// Game specific routes
router.get('/game/:appId/playtime', steamController.getGamePlaytime);
router.get('/game/:appId/achievements', steamController.getGameAchievements);
router.get('/game/lfd2/stats/:steamId', steamController.getL4dStats);

// User statistics routes
router.get('/mystats', steamController.getMyStats);
router.get('/stats/:steamId', steamController.getUserStats);
router.get('/playtime-summary', steamController.getPlaytimeSummary);
router.get('/recent-games', steamController.getRecentGames);

export default router; 
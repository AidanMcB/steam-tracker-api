import express from 'express';
import * as friendController from '../controllers/friendController';

const router = express.Router();

// Friend list routes
router.get('/list', friendController.getFriendList);
router.get('/list/:steamId', friendController.getFriendList);
router.get('/details', friendController.getFriendsWithDetails);
router.get('/details/:steamId', friendController.getFriendsWithDetails);

// Friend comparison routes
router.get('/shared-games/:friendId', friendController.getSharedGames);
router.get('/compare-playtime/:friendId', friendController.comparePlaytimeSummary);
router.get('/compare-game/:friendId/playtime/:appId', friendController.compareGamePlaytime);
router.get('/compare-game/:friendId/achievements/:appId', friendController.compareGameAchievements);

export default router; 
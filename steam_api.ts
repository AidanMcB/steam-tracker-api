/**
 * Steam API Test Script
 * 
 * This script provides a simple way to test the Steam API functionality
 * without running the full Express server. It can be used for quick testing
 * and debugging of Steam API calls.
 */

import dotenv from 'dotenv';
import * as steamService from './src/services/steamService';
import * as friendService from './src/services/friendService';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get the Steam ID from environment variables or use a default
const steamId = process.env.HM_STEAM_ID || '76561198401526411';

/**
 * Main function to run tests
 */
async function runTests() {
    try {
        console.log('Steam API Test Script');
        console.log('-------------------');
        console.log(`Using Steam ID: ${steamId}`);
        console.log();

        // Test user profile
        console.log('Fetching user profile...');
        const userProfile = await steamService.getUserSummary(steamId);
        console.log(`User: ${userProfile.personaname}`);
        console.log();

        // Test user's games
        console.log('Fetching owned games...');
        const ownedGames = await steamService.getUserOwnedGames(steamId);
        console.log(`Total games: ${ownedGames.game_count}`);
        console.log();

        // Test playtime summary
        console.log('Generating playtime summary...');
        const playtimeSummary = await steamService.getPlaytimeSummary(steamId);
        console.log(`Total playtime: ${playtimeSummary.total_playtime_hours} hours`);
        console.log(`Average playtime: ${playtimeSummary.average_playtime_hours} hours per game`);
        console.log('Top 3 games:');
        playtimeSummary.top_games.slice(0, 3).forEach(game => {
            console.log(`- ${game.name}: ${game.playtime_hours} hours (${game.percentage})`);
        });
        console.log();

        // Test friends list
        console.log('Fetching friends list...');
        const friendsList = await friendService.getFriendList(steamId);
        
        if ('error' in friendsList) {
            console.log(`Error: ${friendsList.error}`);
        } else {
            console.log(`Total friends: ${friendsList.length}`);
        }
        
        console.log();
        console.log('Tests completed successfully!');

    } catch (error) {
        console.error('Error running tests:', (error as Error).message);
    }
}

// Run the tests
runTests(); 
# Steam API Explorer

A Node.js API for exploring Steam data including game playtime, achievements, friends, and comparisons.

## Features

-   Express.js server with modular architecture
-   RESTful API endpoints
-   Comprehensive Steam API integration
-   Environment variables for secure API key storage
-   Game playtime statistics
-   Achievement tracking
-   Friend data and comparisons
-   Shared games analysis
-   ESLint and Prettier for consistent code formatting
-   Docker support for easy deployment
-   Username lookup (use either Steam ID or username)
-   TypeScript for type safety and better developer experience

## API Endpoints

### Steam User Data

-   `GET /api/steam/user/:steamId`: Get a user's profile information (can use Steam ID or username)
-   `GET /api/steam/games/:steamId`: Get a list of games owned by a user (can use Steam ID or username)
-   `GET /api/steam/app/:appId`: Get details about a specific Steam game
-   `GET /api/steam/mystats`: Get complete stats for your Steam profile

### Game Statistics

-   `GET /api/steam/game/:appId/playtime`: Get playtime stats for a specific game
-   `GET /api/steam/game/:appId/achievements`: Get achievement data for a specific game
-   `GET /api/steam/playtime-summary`: Get a summary of playtime across all games
-   `GET /api/steam/recent-games`: Get recently played games

### Friends

-   `GET /api/friends/list`: Get your friend list
-   `GET /api/friends/list/:steamId`: Get friend list for a specific user (can use Steam ID or username)
-   `GET /api/friends/details`: Get detailed information about your friends
-   `GET /api/friends/details/:steamId`: Get detailed information about a user's friends (can use Steam ID or username)

### Friend Comparisons

-   `GET /api/friends/shared-games/:friendId`: Get games both you and your friend own (can use Steam ID or username)
-   `GET /api/friends/compare-playtime/:friendId`: Compare overall playtime statistics with a friend (can use Steam ID or username)
-   `GET /api/friends/compare-game/:friendId/playtime/:appId`: Compare playtime for a specific game with a friend (can use Steam ID or username)
-   `GET /api/friends/compare-game/:friendId/achievements/:appId`: Compare achievements for a specific game with a friend (can use Steam ID or username)

## Steam IDs and Usernames

This API supports both Steam IDs and Steam vanity URLs (usernames) for most endpoints. For example:

- Using a Steam ID: `/api/steam/user/76561198012345678`
- Using a username: `/api/steam/user/gabelogannewell`

Steam IDs are 17-digit numbers, while vanity URLs are the custom URLs you set for your Steam profile.

## Setup

### Standard Setup

1. Install dependencies:

```
npm install
```

2. Configure the Steam API:

    - Create a `.env.local` file in the root directory
    - Add your Steam API key: `STEAM_API_KEY=your_api_key_here`
    - Add your Steam ID: `HM_STEAM_ID=your_steam_id_here`
    - Optionally add game IDs for games you want to track: `APP_ID_L4D_2=550`
    - Get a Steam API key at: https://steamcommunity.com/dev/apikey
    - Find your Steam ID at: https://steamid.io/

3. Build the TypeScript code:

```
npm run build
```

4. Start the server:

```
npm start
```

For development with auto-reload:

```
npm run dev
```

### Docker Setup

1. Configure the Steam API:

    - Create a `.env.local` file in the root directory with your Steam API key and Steam ID as described above

2. Build and run with Docker Compose:

```
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container in detached mode
- Mount your `.env.local` file into the container
- Expose the API on port 3008

To stop the container:

```
docker-compose down
```

### Manual Docker Build

If you prefer to build and run manually:

```bash
# Build the Docker image
docker build -t steam-api-explorer .

# Run the container
docker run -p 3008:3008 -v $(pwd)/.env.local:/usr/src/app/.env.local -d --name steam-api steam-api-explorer
```

## Code Style and Linting

This project uses ESLint and Prettier to maintain consistent code style with 4-space indentation. To ensure your code follows the project standards:

-   Run `npm run lint` to check for linting issues
-   Run `npm run lint:fix` to automatically fix linting issues
-   Run `npm run format` to format all files using Prettier

## Testing the API

Once the server is running, you can access the API at: http://localhost:3008

### Example API Requests

Using curl:

```bash
# Get welcome message
curl http://localhost:3008

# Get your Steam profile stats
curl http://localhost:3008/api/steam/mystats

# Get a user profile by username
curl http://localhost:3008/api/steam/user/gabelogannewell

# Get your friend list
curl http://localhost:3008/api/friends/list

# Get detailed information about your friends
curl http://localhost:3008/api/friends/details

# Compare playtime with a friend (using username)
curl http://localhost:3008/api/friends/compare-playtime/johnsmith

# Get games you share with a friend
curl http://localhost:3008/api/friends/shared-games/76561198012345678

# Compare achievements for Left 4 Dead 2 with a friend
curl http://localhost:3008/api/friends/compare-game/76561198012345678/achievements/550

# Compare playtime for Left 4 Dead 2 with a friend
curl http://localhost:3008/api/friends/compare-game/76561198012345678/playtime/550
```

Or use tools like Postman or Insomnia for a more user-friendly interface.

## Project Structure

```
├── .env.local              # Environment variables (not in repo)
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── .eslintignore           # Files to ignore for linting
├── .dockerignore           # Files to exclude from Docker builds
├── Dockerfile              # Docker build instructions
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── src/                    # Source code
│   ├── index.ts            # Main application entry point
│   ├── controllers/        # API route handlers
│   │   ├── steamController.ts
│   │   └── friendController.ts
│   ├── services/           # Business logic
│   │   ├── steamService.ts
│   │   └── friendService.ts
│   ├── routes/             # Route definitions
│   │   ├── steamRoutes.ts
│   │   └── friendRoutes.ts
│   └── types/              # TypeScript type definitions
│       ├── steam.ts
│       └── express.ts
└── README.md               # Project documentation
```

## Finding Game AppIDs

To find a specific game's AppID:

1. Go to the game's Steam Store page
2. The number in the URL is the AppID
   Example: https://store.steampowered.com/app/550/Left_4_Dead_2/ (AppID is 550)
# steam-tracker-api

// Steam API Types

export interface SteamUser {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    lastlogoff?: number;
    personastate: number;
    primaryclanid?: string;
    timecreated?: number;
    personastateflags?: number;
    loccountrycode?: string;
    locstatecode?: string;
    loccityid?: number;
}

export interface SteamGame {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url: string;
    img_logo_url: string;
    has_community_visible_stats?: boolean;
    playtime_2weeks?: number;
    rtime_last_played?: number;
}

export interface SteamOwnedGames {
    game_count: number;
    games: SteamGame[];
}

export interface SteamAppDetails {
    success: boolean;
    data?: {
        type: string;
        name: string;
        steam_appid: number;
        required_age: number;
        is_free: boolean;
        dlc?: number[];
        detailed_description: string;
        about_the_game: string;
        short_description: string;
        supported_languages: string;
        header_image: string;
        website?: string;
        developers?: string[];
        publishers?: string[];
        price_overview?: {
            currency: string;
            initial: number;
            final: number;
            discount_percent: number;
            initial_formatted: string;
            final_formatted: string;
        };
        platforms: {
            windows: boolean;
            mac: boolean;
            linux: boolean;
        };
        categories?: {
            id: number;
            description: string;
        }[];
        genres?: {
            id: number;
            description: string;
        }[];
        release_date: {
            coming_soon: boolean;
            date: string;
        };
        background: string;
        background_raw: string;
        screenshots?: {
            id: number;
            path_thumbnail: string;
            path_full: string;
        }[];
        movies?: {
            id: number;
            name: string;
            thumbnail: string;
            webm: {
                480: string;
                max: string;
            };
            mp4: {
                480: string;
                max: string;
            };
            highlight: boolean;
        }[];
    };
}

export interface GamePlaytime {
    appid: number;
    name: string;
    img_icon_url: string;
    img_logo_url: string;
    playtime: {
        total_hours: number;
        recent_hours: number;
        last_played: string | null;
    };
}

export interface AchievementData {
    name: string;
    unlock_time: string;
}

export interface GameAchievements {
    game_name: string;
    total_achievements: number;
    unlocked_achievements: number;
    activity_by_month: Record<string, number>;
    activity_by_year: Record<string, number>;
    achievement_history: AchievementData[];
}

export interface PlaytimeSummary {
    total_games: number;
    total_playtime_hours: number;
    average_playtime_hours: number;
    top_games: Partial<SteamGame>[];
    games_with_playtime: number;
    games_never_played: number;
}

export interface SteamFriend {
    steamid: string;
    relationship: string;
    friend_since: number;
}

export interface FriendWithDetails extends SteamFriend {
    profile?: SteamUser;
}

export interface GameComparison {
    appid: number;
    name: string;
    user1: {
        steamid: string;
        playtime_hours: number;
        percentage?: string;
    };
    user2: {
        steamid: string;
        playtime_hours: number;
        percentage?: string;
    };
    difference: number;
    difference_percentage?: string;
}

export interface AchievementComparison {
    game_name: string;
    total_achievements: number;
    user1: {
        steamid: string;
        unlocked_achievements: number;
        percentage: string;
    };
    user2: {
        steamid: string;
        unlocked_achievements: number;
        percentage: string;
    };
    difference: number;
    difference_percentage: string;
}

export interface SharedGames {
    shared_count: number;
    total_user1: number;
    total_user2: number;
    shared_games: {
        appid: number;
        name: string;
        user1_playtime: string;
        user2_playtime: string;
    }[];
}

export interface PlaytimeComparison {
    user1: {
        steamid: string;
        total_games: number;
        total_playtime_hours: number;
        average_playtime_hours: number;
    };
    user2: {
        steamid: string;
        total_games: number;
        total_playtime_hours: number;
        average_playtime_hours: number;
    };
    difference: {
        total_games: number;
        total_playtime_hours: number;
        average_playtime_hours: number;
    };
    top_games_comparison: GameComparison[];
}

export interface ErrorResponse {
    error: string;
    details?: string;
    steam_id?: string;
    game_id?: number | string;
} 
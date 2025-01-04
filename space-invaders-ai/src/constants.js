// Convert absolute pixels to relative screen units
export function relativeToScreen(size, dimension, baseSize) {
    return (size / baseSize) * 100; // returns percentage of screen
}

// Player settings (all speeds and positions in percentages)
export const PLAYER_SETTINGS = {
    // Size will be set relative to actual screen dimensions
    SPEED: 0.4, // 40% of screen width per second
    SHOOT_DELAY: 250,
    BULLET_SPEED: 0.5, // 50% of screen height per second
    STARTING_Y_PERCENT: 85,
    LIVES: 3
};

// Enemy settings
export const ENEMY_SETTINGS = {
    ROWS: 5,
    COLS: 11,
    // Size will be set relative to actual screen dimensions
    HORIZONTAL_SPACING_PERCENT: 2.3,
    VERTICAL_SPACING_PERCENT: 3.1,
    STARTING_Y_PERCENT: 5,
    BASE_SPEED: 0.05, // 5% of screen width per second
    SPEED_INCREASE: 0.02,
    SPEED_SCALE_FACTOR: 0.1,  // How much to increase speed per enemy destroyed
    MAX_SPEED_MULTIPLIER: 3,  // Maximum speed multiplier when few enemies remain
    DROP_DISTANCE_PERCENT: 6.25,
    SHOOTING_INTERVAL: 2000,
    SHOOTING_CHANCE: 0.3,
    BULLET_SPEED: 0.3, // 30% of screen height per second
    POINTS: {
        ROW_0: 50,
        ROW_1: 40,
        ROW_2: 30,
        ROW_3: 20,
        ROW_4: 10
    },
    ROW_PATTERNS: [
        'enemy1',
        'enemy2',
        'enemy3',
        'enemy4',
        'enemy5'
    ]
};

// Visual settings
export const COLORS = {
    BACKGROUND: '#000000',
    PLAYER_BULLET: '#FFFFFF',
    ENEMY_BULLET: '#FF0000',
    TEXT: '#FFFFFF',
    SCORE: '#FFFFFF',
    LIVES: '#00FF00',
    GROUND: '#33FF33'
};

// Star field settings
export const STAR_SETTINGS = {
    COUNT: 50,
    SPEED_PERCENT: 0.1
};

// UI settings
export const UI_SETTINGS = {
    SCORE_X_PERCENT: 1.5,
    SCORE_Y_PERCENT: 6.25,
    LIVES_X_PERCENT: 84.4,
    LIVES_Y_PERCENT: 6.25,
    GAME_OVER_FONT_SIZE_PERCENT: 8.33,
    SCORE_FONT_SIZE_PERCENT: 4.17,
    LIVES_FONT_SIZE_PERCENT: 4.17
};

// Ground settings
export const GROUND_SETTINGS = {
    Y_PERCENT: 90,
    HEIGHT: 2
};

// Sound settings
export const SOUND_SETTINGS = {
    VOLUME: 0.7,
    SHOOT_VOLUME: 0.5,
    EXPLOSION_VOLUME: 0.8
};
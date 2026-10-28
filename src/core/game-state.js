export const GAME_STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER',
    PORTFOLIO: 'PORTFOLIO'
};

class GameState {
    constructor() {
        this.current = GAME_STATES.MENU;
        this.listeners = [];
    }

    setState(newState) {
        if (this.current !== newState) {
            this.current = newState;
            this.listeners.forEach(callback => callback(this.current));
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }
}

export const gameState = new GameState();
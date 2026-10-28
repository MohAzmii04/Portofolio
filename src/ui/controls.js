import { gameState, GAME_STATES } from '../core/game-state.js';
import { themeManager } from '../core/theme.js';

export function setupControls(player, onRetryCallback) {
    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
        if (gameState.current !== GAME_STATES.PLAYING) return;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            player.moveLeft();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            player.moveRight();
        }
    });

    // Touch / On-Screen Steering Buttons (Mobile & Desktop clicks)
    const btnTouchLeft = document.getElementById('btn-touch-left');
    const btnTouchRight = document.getElementById('btn-touch-right');

    if (btnTouchLeft) {
        btnTouchLeft.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (gameState.current === GAME_STATES.PLAYING) player.moveLeft();
        });
    }

    if (btnTouchRight) {
        btnTouchRight.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (gameState.current === GAME_STATES.PLAYING) player.moveRight();
        });
    }

    // Theme Toggle Buttons
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeManager.toggleTheme();
        });
    });

    // UI Buttons Listener
    const btnHudSkip = document.getElementById('btn-hud-skip');
    const btnRetry = document.getElementById('btn-retry');
    const btnGameOverSkip = document.getElementById('btn-gameover-skip');
    const btnBackToGame = document.getElementById('btn-back-to-game');

    const startScreen = document.getElementById('start-screen');
    const hud = document.getElementById('hud');
    const gameOverScreen = document.getElementById('game-over-screen');
    const portfolioScreen = document.getElementById('portfolio-screen');

    function updateScreens(state) {
        if (startScreen) startScreen.classList.add('hidden');

        if (hud) {
            hud.classList.toggle('hidden', state !== GAME_STATES.PLAYING);
        }

        if (gameOverScreen) {
            gameOverScreen.classList.toggle('hidden', state !== GAME_STATES.GAMEOVER);
            gameOverScreen.classList.toggle('active', state === GAME_STATES.GAMEOVER);
        }

        if (portfolioScreen) {
            portfolioScreen.classList.toggle('hidden', state !== GAME_STATES.PORTFOLIO);
            portfolioScreen.classList.toggle('active', state === GAME_STATES.PORTFOLIO);
        }
    }

    gameState.subscribe(updateScreens);

    // Button Actions
    if (btnHudSkip) {
        btnHudSkip.addEventListener('click', () => {
            gameState.setState(GAME_STATES.PORTFOLIO);
        });
    }

    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            if (onRetryCallback) onRetryCallback();
            gameState.setState(GAME_STATES.PLAYING);
        });
    }

    if (btnGameOverSkip) {
        btnGameOverSkip.addEventListener('click', () => {
            gameState.setState(GAME_STATES.PORTFOLIO);
        });
    }

    if (btnBackToGame) {
        btnBackToGame.addEventListener('click', () => {
            if (onRetryCallback) onRetryCallback();
            gameState.setState(GAME_STATES.PLAYING);
        });
    }
}

export function setFinalScore(score) {
    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) finalScoreEl.innerText = score.toLocaleString();
}
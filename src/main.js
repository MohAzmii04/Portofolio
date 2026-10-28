import * as THREE from 'three';
import { setupScene } from './core/scene.js';
import { setupCamera, updateCamera } from './core/camera.js';
import { gameState, GAME_STATES } from './core/game-state.js';
import { Player } from './game/player.js';
import { Road } from './game/road.js';
import { ObstacleManager } from './game/obstacle.js';
import { setupControls, setFinalScore } from './ui/controls.js';
import { HUD } from './ui/hud.js';
import { setupPortfolioGarage } from './portfolio/garage.js';

// Inisialisasi Core
const { scene, camera, renderer } = setupScene();
setupCamera(camera);

// Inisialisasi Game Objects, UI, & Portfolio
const player = new Player(scene);
const road = new Road(scene);
const obstacleManager = new ObstacleManager(scene);
const hud = new HUD();

const resetGame = () => {
    player.reset();
    obstacleManager.reset();
    hud.reset();
};

setupControls(player, resetGame);
setupPortfolioGarage();

// Clock untuk Delta Time
const clock = new THREE.Clock();

// LANGSUNG MULAI GAME SAAT HALAMAN DIBUKA
gameState.setState(GAME_STATES.PLAYING);

// Game Loop Utama
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const isPlaying = (gameState.current === GAME_STATES.PLAYING);

    if (isPlaying) {
        player.update(delta);
        road.update(delta, isPlaying);
        obstacleManager.update(delta, road.speed, isPlaying);
        hud.update(delta, isPlaying);
        updateCamera(camera, player.mesh);

        // Cek Tabrakan dengan Rintangan
        if (obstacleManager.checkCollision(player.mesh)) {
            setFinalScore(hud.score);
            gameState.setState(GAME_STATES.GAMEOVER);
        }

        // Cek target jarak 600 meter (Finish Gate)
        if (hud.getDistance() >= 600) {
            gameState.setState(GAME_STATES.PORTFOLIO);
        }
    }

    renderer.render(scene, camera);
}

animate();

console.log("Auto-start game & Skip button di pojok kanan berhasil diterapkan.");
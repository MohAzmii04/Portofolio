import * as THREE from 'three';

export function setupCamera(camera) {
    // Set initial position for third-person view behind the car
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, -2);
}

export function updateCamera(camera, playerMesh) {
    if (!playerMesh) return;

    // Smoothly follow the player's X position
    const targetX = playerMesh.position.x * 0.5; // Slight lag for smoothness
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y = 4;
    camera.position.z = playerMesh.position.z + 8;

    camera.lookAt(playerMesh.position.x * 0.3, 0.5, playerMesh.position.z - 4);
}
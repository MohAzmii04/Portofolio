import * as THREE from 'three';
import { themeManager } from '../core/theme.js';

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.8;
        this.lanes = [-2.5, 0, 2.5]; // 3 Lanes

        // Crash effect particles
        this.impactParticles = [];
        this.impactParticleGroup = new THREE.Group();
        this.scene.add(this.impactParticleGroup);

        this.pulseTime = 0;
        this.isLight = themeManager.getTheme() === 'light';
        themeManager.subscribe(t => {
            this.isLight = t === 'light';
        });
    }

    createObstacleMesh() {
        const group = new THREE.Group();

        // Barrier Base Support Pillars (Left & Right)
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x1f2937,
            metalness: 0.8,
            roughness: 0.3
        });

        const hazardMat = new THREE.MeshBasicMaterial({
            color: this.isLight ? 0xea580c : 0xff7700
        });

        [-0.65, 0.65].forEach(x => {
            // Base cylinder
            const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 12);
            const base = new THREE.Mesh(baseGeo, pillarMat);
            base.position.set(x, 0.4, 0);
            base.castShadow = true;
            group.add(base);

            // Flashing warning beacon on top
            const beaconGeo = new THREE.SphereGeometry(0.12, 10, 10);
            const beacon = new THREE.Mesh(beaconGeo, hazardMat);
            beacon.position.set(x, 0.88, 0);
            group.add(beacon);
        });

        // Holographic Cyber Energy Shield Barrier (Center)
        const shieldGeo = new THREE.BoxGeometry(1.3, 0.55, 0.1);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: this.isLight ? 0xef4444 : 0xff3b30,
            emissive: this.isLight ? 0xd97706 : 0xff5500,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.85,
            roughness: 0.2,
            metalness: 0.5
        });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        shield.position.set(0, 0.45, 0);
        shield.castShadow = true;
        group.add(shield);
        group.userData.shield = shield;

        // Warning Strip / Chevrons
        const stripGeo = new THREE.BoxGeometry(1.2, 0.12, 0.12);
        const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(0, 0.45, 0);
        group.add(strip);

        return group;
    }

    spawn() {
        const mesh = this.createObstacleMesh();

        // Random lane
        const randomLaneIndex = Math.floor(Math.random() * this.lanes.length);
        const laneX = this.lanes[randomLaneIndex];

        // Start at z = -80
        mesh.position.set(laneX, 0, -85);

        this.scene.add(mesh);
        this.obstacles.push(mesh);
    }

    update(delta, roadSpeed, isPlaying) {
        if (!isPlaying) return;

        this.pulseTime += delta * 6;

        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawn();
            this.spawnTimer = 0;
            this.spawnInterval = Math.max(0.95, this.spawnInterval - 0.02);
        }

        const moveSpeed = roadSpeed * delta;
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.position.z += moveSpeed;

            // Pulse emissive shield
            if (obs.userData && obs.userData.shield) {
                obs.userData.shield.material.emissiveIntensity = 0.6 + Math.sin(this.pulseTime) * 0.4;
            }

            // Remove if past player
            if (obs.position.z > 8) {
                this.scene.remove(obs);
                this.obstacles.splice(i, 1);
            }
        }

        // Update crash particles
        for (let i = this.impactParticles.length - 1; i >= 0; i--) {
            const p = this.impactParticles[i];
            p.life -= delta;
            p.mesh.position.x += p.vx * delta;
            p.mesh.position.y += p.vy * delta;
            p.mesh.position.z += p.vz * delta;
            p.vy -= 9.8 * delta; // gravity

            p.mesh.scale.multiplyScalar(0.96);

            if (p.life <= 0) {
                this.impactParticleGroup.remove(p.mesh);
                this.impactParticles.splice(i, 1);
            }
        }
    }

    triggerCrashSparks(pos) {
        const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
        const sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);

        for (let i = 0; i < 24; i++) {
            const spark = new THREE.Mesh(sparkGeo, sparkMat);
            spark.position.copy(pos);
            this.impactParticleGroup.add(spark);

            this.impactParticles.push({
                mesh: spark,
                life: 0.8 + Math.random() * 0.4,
                vx: (Math.random() - 0.5) * 12,
                vy: 3 + Math.random() * 8,
                vz: (Math.random() - 0.5) * 12
            });
        }
    }

    checkCollision(playerMesh) {
        if (!playerMesh) return false;

        const playerBox = new THREE.Box3().setFromObject(playerMesh);
        playerBox.expandByScalar(-0.25); // Tolerant hitbox

        for (const obs of this.obstacles) {
            const obsBox = new THREE.Box3().setFromObject(obs);
            if (playerBox.intersectsBox(obsBox)) {
                this.triggerCrashSparks(obs.position);
                return true;
            }
        }
        return false;
    }

    reset() {
        this.obstacles.forEach(obs => this.scene.remove(obs));
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1.8;

        this.impactParticles.forEach(p => this.impactParticleGroup.remove(p.mesh));
        this.impactParticles = [];
    }
}
import * as THREE from 'three';
import { themeManager } from '../core/theme.js';

export class Road {
    constructor(scene) {
        this.scene = scene;
        this.roadLength = 220;
        this.speed = 28; // Kecepatan jalan bergerak ke belakang

        this.roadMesh = null;
        this.lineSegments = [];
        this.curbSegments = [];
        this.sceneryGroup = new THREE.Group();
        this.streetLampGroup = new THREE.Group();
        this.cityGroup = new THREE.Group();
        this.dustParticleGroup = new THREE.Group();
        this.dustParticles = [];

        // Materials for dynamic theme updating
        this.roadMat = null;
        this.lineMat = null;
        this.guardrailMats = [];
        this.lampMats = [];
        this.buildingMats = [];

        this.createRoad();
        this.createGuardrails();
        this.createStreetLamps();
        this.createDistantCityscape();
        this.createSpeedDust();

        themeManager.subscribe((theme) => this.onThemeChange(theme));
    }

    createRoad() {
        // Main Roadbed (Width: 8.4 units for 3 lanes of 2.5 width + shoulders)
        const roadGeo = new THREE.PlaneGeometry(8.4, this.roadLength, 1, 32);
        this.roadMat = new THREE.MeshStandardMaterial({
            color: 0x111622,
            roughness: 0.82,
            metalness: 0.15
        });
        this.roadMesh = new THREE.Mesh(roadGeo, this.roadMat);
        this.roadMesh.rotation.x = -Math.PI / 2;
        this.roadMesh.position.z = -this.roadLength / 2 + 10;
        this.roadMesh.receiveShadow = true;
        this.scene.add(this.roadMesh);

        // Dashed Lane Dividing Lines
        const lineGeo = new THREE.PlaneGeometry(0.18, 3.2);
        this.lineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

        for (let i = -1; i <= 1; i += 2) {
            // Lane division at x = -1.25 and x = 1.25
            for (let z = 10; z > -this.roadLength; z -= 6.5) {
                const line = new THREE.Mesh(lineGeo, this.lineMat);
                line.rotation.x = -Math.PI / 2;
                line.position.set(i * 1.25, 0.015, z);
                this.scene.add(line);
                this.lineSegments.push(line);
            }
        }

        // Side Curbs / Rumble Strips (Alternating red and white/cyan along shoulders)
        const curbWidth = 0.35;
        const curbLength = 2.0;
        const curbWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const curbRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

        [-4.2, 4.2].forEach(x => {
            for (let z = 10; z > -this.roadLength; z -= curbLength) {
                const isEven = Math.floor(Math.abs(z) / curbLength) % 2 === 0;
                const curbGeo = new THREE.BoxGeometry(curbWidth, 0.08, curbLength);
                const curb = new THREE.Mesh(curbGeo, isEven ? curbRedMat : curbWhiteMat);
                curb.position.set(x, 0.04, z);
                curb.receiveShadow = true;
                this.scene.add(curb);
                this.curbSegments.push(curb);
            }
        });
    }

    createGuardrails() {
        const railMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        this.guardrailMats.push(railMat);

        [-4.4, 4.4].forEach(x => {
            // Continuous glowing neon guardrail
            const railGeo = new THREE.BoxGeometry(0.08, 0.25, this.roadLength);
            const rail = new THREE.Mesh(railGeo, railMat);
            rail.position.set(x, 0.2, -this.roadLength / 2 + 10);
            this.scene.add(rail);

            // Ground shoulder grass / terrain border
            const shoulderGeo = new THREE.PlaneGeometry(16, this.roadLength);
            const shoulderMat = new THREE.MeshStandardMaterial({
                color: 0x0a0f18,
                roughness: 0.95
            });
            this.buildingMats.push(shoulderMat);
            const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
            shoulder.rotation.x = -Math.PI / 2;
            shoulder.position.set(x > 0 ? 12 : -12, -0.01, -this.roadLength / 2 + 10);
            shoulder.receiveShadow = true;
            this.scene.add(shoulder);
        });
    }

    createStreetLamps() {
        this.scene.add(this.streetLampGroup);

        const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
        const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        this.lampMats.push(lampGlowMat);

        // Place futuristic arched street lamps every 18 meters along both sides
        for (let z = 10; z > -this.roadLength; z -= 18) {
            [-4.7, 4.7].forEach(x => {
                const lampGroup = new THREE.Group();
                const isLeft = x < 0;

                // Vertical pole
                const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 4.5, 12);
                const pole = new THREE.Mesh(poleGeo, poleMat);
                pole.position.y = 2.25;
                pole.castShadow = true;
                lampGroup.add(pole);

                // Cantilever arm arching over the road
                const armGeo = new THREE.BoxGeometry(1.6, 0.08, 0.08);
                const arm = new THREE.Mesh(armGeo, poleMat);
                arm.position.set(isLeft ? 0.7 : -0.7, 4.4, 0);
                lampGroup.add(arm);

                // Glowing lamp head
                const headGeo = new THREE.BoxGeometry(0.5, 0.1, 0.25);
                const head = new THREE.Mesh(headGeo, lampGlowMat);
                head.position.set(isLeft ? 1.3 : -1.3, 4.35, 0);
                lampGroup.add(head);

                lampGroup.position.set(x, 0, z);
                this.streetLampGroup.add(lampGroup);
            });
        }
    }

    createDistantCityscape() {
        this.scene.add(this.cityGroup);

        // Create sleek futuristic skyscraper silhouettes in the background
        const buildingColors = [0x0f172a, 0x1e293b, 0x090d16];
        const windowGlowColors = [0x00f0ff, 0x38bdf8, 0xec4899, 0xfacc15];

        for (let i = 0; i < 28; i++) {
            const width = 6 + Math.random() * 8;
            const depth = 6 + Math.random() * 8;
            const height = 18 + Math.random() * 38;

            const bMat = new THREE.MeshStandardMaterial({
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
                roughness: 0.6,
                metalness: 0.4
            });
            this.buildingMats.push(bMat);

            const bGeo = new THREE.BoxGeometry(width, height, depth);
            const building = new THREE.Mesh(bGeo, bMat);

            // Position left or right outside the roadway
            const side = Math.random() > 0.5 ? 1 : -1;
            const posX = side * (16 + Math.random() * 32);
            const posZ = -60 - Math.random() * 120;
            building.position.set(posX, height / 2 - 2, posZ);
            this.cityGroup.add(building);

            // Add futuristic neon rooftop antenna or accent strip
            if (Math.random() > 0.4) {
                const antennaGeo = new THREE.CylinderGeometry(0.1, 0.15, 6, 8);
                const neonAccentMat = new THREE.MeshBasicMaterial({
                    color: windowGlowColors[Math.floor(Math.random() * windowGlowColors.length)]
                });
                this.lampMats.push(neonAccentMat);
                const antenna = new THREE.Mesh(antennaGeo, neonAccentMat);
                antenna.position.set(posX, height + 1, posZ);
                this.cityGroup.add(antenna);
            }
        }
    }

    createSpeedDust() {
        this.scene.add(this.dustParticleGroup);

        const dustGeo = new THREE.SphereGeometry(0.06, 4, 4);
        const dustMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.55
        });
        this.lampMats.push(dustMat);

        for (let i = 0; i < 50; i++) {
            const particle = new THREE.Mesh(dustGeo, dustMat);
            particle.position.set(
                (Math.random() - 0.5) * 12,
                0.2 + Math.random() * 3.5,
                -Math.random() * 80
            );
            this.dustParticles.push(particle);
            this.dustParticleGroup.add(particle);
        }
    }

    update(delta, isPlaying) {
        if (!isPlaying) return;

        const moveDistance = this.speed * delta;

        // Loop lane dashes
        this.lineSegments.forEach(line => {
            line.position.z += moveDistance;
            if (line.position.z > 12) {
                line.position.z -= this.roadLength;
            }
        });

        // Loop side curbs
        this.curbSegments.forEach(curb => {
            curb.position.z += moveDistance;
            if (curb.position.z > 12) {
                curb.position.z -= this.roadLength;
            }
        });

        // Loop street lamps
        this.streetLampGroup.children.forEach(lamp => {
            lamp.position.z += moveDistance;
            if (lamp.position.z > 14) {
                lamp.position.z -= this.roadLength;
            }
        });

        // Parallax scroll on distant cityscape (moves slower for depth illusion)
        this.cityGroup.children.forEach(b => {
            b.position.z += moveDistance * 0.25;
            if (b.position.z > 10) {
                b.position.z -= 140;
            }
        });

        // Speed dust particles moving fast toward the camera
        this.dustParticles.forEach(p => {
            p.position.z += moveDistance * 1.5;
            if (p.position.z > 10) {
                p.position.z = -70 - Math.random() * 20;
                p.position.x = (Math.random() - 0.5) * 12;
                p.position.y = 0.2 + Math.random() * 3.5;
            }
        });
    }

    onThemeChange(theme) {
        const isLight = theme === 'light';

        if (this.roadMat) {
            this.roadMat.color.setHex(isLight ? 0x475569 : 0x111622);
            this.roadMat.roughness = isLight ? 0.9 : 0.82;
        }

        if (this.lineMat) {
            this.lineMat.color.setHex(isLight ? 0xffffff : 0x00f0ff);
        }

        this.guardrailMats.forEach(m => {
            m.color.setHex(isLight ? 0x0284c7 : 0x00f0ff);
        });

        this.lampMats.forEach(m => {
            m.color.setHex(isLight ? 0x0284c7 : 0x38bdf8);
        });

        this.buildingMats.forEach(m => {
            m.color.setHex(isLight ? 0xcfd8dc : 0x0f172a);
        });
    }
}
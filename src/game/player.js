import * as THREE from 'three';
import { themeManager } from '../core/theme.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.currentLane = 1; // 0: Left, 1: Center, 2: Right
        this.laneWidth = 2.5;
        this.targetX = 0;

        // Dynamics & Animation Properties
        this.wheelMeshes = [];
        this.chassisMesh = null;
        this.underglowLight = null;
        this.headlightLeft = null;
        this.headlightRight = null;
        this.particles = [];
        this.particleGroup = new THREE.Group();
        this.engineVibrationTime = 0;

        this.createSuperCar();
        this.createExhaustParticles();

        // Subscribe to theme updates
        themeManager.subscribe((theme) => this.onThemeChange(theme));
    }

    createSuperCar() {
        const carRoot = new THREE.Group();
        const chassisGroup = new THREE.Group();

        // 1. Materials
        const bodyPaintMat = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            metalness: 0.85,
            roughness: 0.22,
            envMapIntensity: 1.2
        });
        this.bodyPaintMat = bodyPaintMat;

        const carbonMat = new THREE.MeshStandardMaterial({
            color: 0x111622,
            metalness: 0.4,
            roughness: 0.5
        });

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x0a101d,
            metalness: 0.95,
            roughness: 0.05
        });

        const glowCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const glowRedMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
        const wheelTireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
        const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
        const brakeCaliperMat = new THREE.MeshStandardMaterial({ color: 0xff4500, metalness: 0.5, roughness: 0.3 });

        // 2. Main Body Lower Section (Chassis)
        const mainBodyGeo = new THREE.BoxGeometry(1.4, 0.38, 2.7);
        const mainBody = new THREE.Mesh(mainBodyGeo, bodyPaintMat);
        mainBody.position.set(0, 0.32, 0);
        mainBody.castShadow = true;
        mainBody.receiveShadow = true;
        chassisGroup.add(mainBody);

        // 3. Front Wedge / Slanted Hood
        const hoodGeo = new THREE.BoxGeometry(1.3, 0.2, 1.1);
        const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
        hood.position.set(0, 0.4, -0.85);
        hood.rotation.x = 0.12;
        hood.castShadow = true;
        chassisGroup.add(hood);

        // Hood Scoop / Air Vent (Carbon)
        const scoopGeo = new THREE.BoxGeometry(0.5, 0.06, 0.45);
        const scoop = new THREE.Mesh(scoopGeo, carbonMat);
        scoop.position.set(0, 0.48, -0.75);
        scoop.rotation.x = 0.12;
        chassisGroup.add(scoop);

        // Front Splitter / Bumper (Carbon)
        const splitterGeo = new THREE.BoxGeometry(1.46, 0.08, 0.4);
        const splitter = new THREE.Mesh(splitterGeo, carbonMat);
        splitter.position.set(0, 0.16, -1.45);
        splitter.castShadow = true;
        chassisGroup.add(splitter);

        // Side Skirts (Carbon)
        [-0.74, 0.74].forEach(x => {
            const skirtGeo = new THREE.BoxGeometry(0.1, 0.1, 1.8);
            const skirt = new THREE.Mesh(skirtGeo, carbonMat);
            skirt.position.set(x, 0.18, 0);
            chassisGroup.add(skirt);
        });

        // 4. Aerodynamic Cockpit / Cabin
        const cabinGeo = new THREE.BoxGeometry(1.05, 0.42, 1.35);
        const cabin = new THREE.Mesh(cabinGeo, glassMat);
        cabin.position.set(0, 0.65, -0.05);
        cabin.castShadow = true;
        chassisGroup.add(cabin);

        // Roof Panel
        const roofGeo = new THREE.BoxGeometry(0.9, 0.05, 0.85);
        const roof = new THREE.Mesh(roofGeo, bodyPaintMat);
        roof.position.set(0, 0.86, -0.05);
        roof.castShadow = true;
        chassisGroup.add(roof);

        // 5. Aggressive Rear Wing / Spoiler
        const wingMainGeo = new THREE.BoxGeometry(1.5, 0.06, 0.35);
        const wing = new THREE.Mesh(wingMainGeo, carbonMat);
        wing.position.set(0, 0.85, 1.25);
        wing.castShadow = true;
        chassisGroup.add(wing);

        // Wing Endplates
        [-0.76, 0.76].forEach(x => {
            const endplateGeo = new THREE.BoxGeometry(0.04, 0.16, 0.4);
            const endplate = new THREE.Mesh(endplateGeo, glowCyanMat);
            endplate.position.set(x, 0.86, 1.25);
            chassisGroup.add(endplate);
        });

        // Wing Struts
        [-0.4, 0.4].forEach(x => {
            const strutGeo = new THREE.BoxGeometry(0.06, 0.3, 0.08);
            const strut = new THREE.Mesh(strutGeo, carbonMat);
            strut.position.set(x, 0.68, 1.2);
            strut.rotation.x = 0.2;
            chassisGroup.add(strut);
        });

        // Rear Diffuser
        const diffuserGeo = new THREE.BoxGeometry(1.3, 0.14, 0.3);
        const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
        diffuser.position.set(0, 0.22, 1.38);
        chassisGroup.add(diffuser);

        // 6. High-Tech LED Headlights (Left & Right)
        [-0.48, 0.48].forEach((x, idx) => {
            const headlightGeo = new THREE.BoxGeometry(0.24, 0.08, 0.15);
            const headlight = new THREE.Mesh(headlightGeo, glowCyanMat);
            headlight.position.set(x, 0.38, -1.36);
            chassisGroup.add(headlight);

            // Real Dynamic Forward Headlight Beam
            const spotLight = new THREE.SpotLight(0x00f0ff, 4.0, 35, Math.PI / 7, 0.5, 1.2);
            spotLight.position.set(x, 0.4, -1.4);
            spotLight.target.position.set(x, 0, -20);
            chassisGroup.add(spotLight);
            chassisGroup.add(spotLight.target);

            if (idx === 0) this.headlightLeft = spotLight;
            else this.headlightRight = spotLight;
        });

        // 7. Full-Width Rear Cyber Neon Light Strip
        const taillightGeo = new THREE.BoxGeometry(1.25, 0.07, 0.08);
        const taillight = new THREE.Mesh(taillightGeo, glowRedMat);
        taillight.position.set(0, 0.46, 1.36);
        chassisGroup.add(taillight);

        // 8. Dual Exhaust Pipes
        [-0.25, 0.25].forEach(x => {
            const exhaustGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 12);
            const exhaust = new THREE.Mesh(exhaustGeo, carbonMat);
            exhaust.rotation.x = Math.PI / 2;
            exhaust.position.set(x, 0.24, 1.36);
            chassisGroup.add(exhaust);

            // Exhaust Interior Glow
            const exhaustFlameGeo = new THREE.CircleGeometry(0.05, 12);
            const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
            const flame = new THREE.Mesh(exhaustFlameGeo, flameMat);
            flame.position.set(x, 0.24, 1.47);
            chassisGroup.add(flame);
        });

        // 9. Dynamic Neon Underglow Light
        const underglow = new THREE.PointLight(0x00f0ff, 2.5, 5, 1.5);
        underglow.position.set(0, 0.12, 0);
        chassisGroup.add(underglow);
        this.underglowLight = underglow;

        // 10. Wheels (4 Sports Alloy Wheels with Calipers)
        const wheelPositions = [
            [-0.72, 0.28, -0.85], // Front Left
            [0.72, 0.28, -0.85],  // Front Right
            [-0.72, 0.28, 0.85],  // Rear Left
            [0.72, 0.28, 0.85]   // Rear Right
        ];

        wheelPositions.forEach((pos, i) => {
            const wheelAssembly = new THREE.Group();

            // Tire
            const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 24);
            const tire = new THREE.Mesh(tireGeo, wheelTireMat);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelAssembly.add(tire);

            // Rim Hub & Spokes
            const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.23, 16);
            const rim = new THREE.Mesh(rimGeo, wheelRimMat);
            rim.rotation.z = Math.PI / 2;
            wheelAssembly.add(rim);

            // Brake Caliper
            const caliperGeo = new THREE.BoxGeometry(0.08, 0.12, 0.1);
            const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
            const isLeft = pos[0] < 0;
            caliper.position.set(isLeft ? 0.05 : -0.05, 0.1, 0);
            wheelAssembly.add(caliper);

            wheelAssembly.position.set(...pos);
            carRoot.add(wheelAssembly);
            this.wheelMeshes.push(wheelAssembly);
        });

        carRoot.add(chassisGroup);
        this.chassisMesh = chassisGroup;

        this.mesh = carRoot;
        this.scene.add(this.mesh);
        this.scene.add(this.particleGroup);
    }

    createExhaustParticles() {
        const particleCount = 20;
        const particleGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const particleMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < particleCount; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat.clone());
            p.visible = false;
            this.particleGroup.add(p);
            this.particles.push({
                mesh: p,
                life: 0,
                maxLife: 0.3 + Math.random() * 0.2,
                vx: 0,
                vy: 0,
                vz: 0
            });
        }
    }

    emitExhaustParticle() {
        const p = this.particles.find(item => item.life <= 0);
        if (!p || !this.mesh) return;

        const side = Math.random() > 0.5 ? -0.25 : 0.25;
        p.mesh.position.set(
            this.mesh.position.x + side + (Math.random() - 0.5) * 0.05,
            0.22 + Math.random() * 0.05,
            this.mesh.position.z + 1.45
        );
        p.life = p.maxLife;
        p.mesh.visible = true;
        p.mesh.scale.set(1, 1, 1);
        p.vx = (Math.random() - 0.5) * 0.4;
        p.vy = 0.2 + Math.random() * 0.3;
        p.vz = 8 + Math.random() * 6; // shoots back
    }

    moveLeft() {
        if (this.currentLane > 0) {
            this.currentLane--;
            this.updateTargetX();
        }
    }

    moveRight() {
        if (this.currentLane < 2) {
            this.currentLane++;
            this.updateTargetX();
        }
    }

    updateTargetX() {
        // Lane 0: -2.5, Lane 1: 0, Lane 2: 2.5
        this.targetX = (this.currentLane - 1) * this.laneWidth;
    }

    update(delta) {
        if (!this.mesh) return;

        // Smooth lane transition (lerp)
        const lerpFactor = 16 * delta;
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * lerpFactor;

        // Calculate steer difference for banking & yaw dynamics
        const diffX = this.targetX - this.mesh.position.x;

        // Banking roll (tilt) & subtle yaw into the turn
        this.mesh.rotation.z = -diffX * 0.16;
        this.mesh.rotation.y = diffX * 0.08;

        // Wheels spin animation (rotating on axle X)
        const spinSpeed = 28 * delta;
        this.wheelMeshes.forEach(wheel => {
            wheel.rotation.x += spinSpeed;
        });

        // Subtle realistic engine idle / chassis rumble
        this.engineVibrationTime += delta * 45;
        if (this.chassisMesh) {
            this.chassisMesh.position.y = Math.sin(this.engineVibrationTime) * 0.012;
        }

        // Exhaust particle emission and update
        if (Math.random() < 0.8) {
            this.emitExhaustParticle();
        }

        this.particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.mesh.position.x += p.vx * delta;
                p.mesh.position.y += p.vy * delta;
                p.mesh.position.z += p.vz * delta;

                const progress = p.life / p.maxLife;
                p.mesh.material.opacity = progress * 0.8;
                p.mesh.scale.setScalar(1 + (1 - progress) * 1.5);

                if (p.life <= 0) {
                    p.mesh.visible = false;
                }
            }
        });
    }

    onThemeChange(theme) {
        const isLight = theme === 'light';
        if (this.bodyPaintMat) {
            // In light mode, deep metallic electric cobalt blue; in dark mode, neon cyan
            this.bodyPaintMat.color.setHex(isLight ? 0x0284c7 : 0x00d4ff);
        }
        if (this.underglowLight) {
            this.underglowLight.color.setHex(isLight ? 0x0284c7 : 0x00f0ff);
            this.underglowLight.intensity = isLight ? 1.6 : 2.5;
        }
        if (this.headlightLeft && this.headlightRight) {
            const hColor = isLight ? 0xffffff : 0x00f0ff;
            this.headlightLeft.color.setHex(hColor);
            this.headlightRight.color.setHex(hColor);
            this.headlightLeft.intensity = isLight ? 5.0 : 4.0;
            this.headlightRight.intensity = isLight ? 5.0 : 4.0;
        }
    }

    reset() {
        this.currentLane = 1;
        this.targetX = 0;
        if (this.mesh) {
            this.mesh.position.set(0, 0, 0);
            this.mesh.rotation.set(0, 0, 0);
        }
        this.particles.forEach(p => {
            p.life = 0;
            p.mesh.visible = false;
        });
    }
}
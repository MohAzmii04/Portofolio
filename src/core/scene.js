import * as THREE from 'three';
import { themeManager } from './theme.js';

export function setupScene() {
    const canvas = document.querySelector('#webgl-canvas');

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 4.5, 8.5);

    // High Quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Cinematic Tone Mapping & Color Management
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Advanced Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0x67e8f9, 1.4);
    dirLight.position.set(15, 28, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    // Subtle Secondary Fill Light
    const fillLight = new THREE.DirectionalLight(0xec4899, 0.35);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    // Theme Update Handler for 3D Environment
    function updateEnvironmentTheme(theme) {
        const isLight = theme === 'light';

        if (isLight) {
            // Light Mode: Fresh, clean daylight aesthetic with soft blue sky & warm sunlight
            const bgColor = 0xeaf0f8;
            scene.background = new THREE.Color(bgColor);
            scene.fog = new THREE.FogExp2(bgColor, 0.011);

            ambientLight.color.setHex(0xffffff);
            ambientLight.intensity = 0.9;

            hemiLight.color.setHex(0xffffff);
            hemiLight.groundColor.setHex(0xa0aec0);
            hemiLight.intensity = 0.85;

            dirLight.color.setHex(0xfff5ea);
            dirLight.intensity = 1.7;

            fillLight.color.setHex(0x38bdf8);
            fillLight.intensity = 0.4;
            renderer.toneMappingExposure = 1.1;
        } else {
            // Dark Mode: Deep cyberpunk midnight atmosphere with neon cyan & magenta fill
            const bgColor = 0x070b16;
            scene.background = new THREE.Color(bgColor);
            scene.fog = new THREE.FogExp2(bgColor, 0.013);

            ambientLight.color.setHex(0x1e293b);
            ambientLight.intensity = 0.65;

            hemiLight.color.setHex(0x38bdf8);
            hemiLight.groundColor.setHex(0x050811);
            hemiLight.intensity = 0.75;

            dirLight.color.setHex(0x38bdf8);
            dirLight.intensity = 1.35;

            fillLight.color.setHex(0xf43f5e);
            fillLight.intensity = 0.45;
            renderer.toneMappingExposure = 1.25;
        }
    }

    // Connect theme changes to scene
    themeManager.subscribe(updateEnvironmentTheme);

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, updateEnvironmentTheme };
}
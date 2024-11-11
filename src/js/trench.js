import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#canvas-trench');
const section = document.querySelector('#trench');

const size = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    aspect: canvas.clientWidth / canvas.clientHeight
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, size.aspect, 0.1, 1000);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.SRGBColorSpace;
renderer.toneMappingExposure = 1;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

scene.background = new THREE.Color(0x0F1A0A);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const loader = new GLTFLoader();

let trench;
let rotationAngle = 0;

async function loadModel() {
    try {
        const gltf = await loader.loadAsync('/models/trench2.glb');
        trench = gltf.scene;
        scene.add(trench);

        trench.scale.set(0.6, 0.6, 0.6); 

        const box = new THREE.Box3().setFromObject(trench);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.2; 

        camera.position.set(0, maxDim * 0.2, cameraDistance);
        camera.lookAt(center);

        console.log('Trench model geladen');
    } catch (error) {
        console.error('Error laden model:', error);
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (trench) {
        rotationAngle += 0.005;
        trench.rotation.y = rotationAngle;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    size.width = canvas.clientWidth;
    size.height = canvas.clientHeight;
    size.aspect = size.width / size.height;
    camera.aspect = size.aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
}

window.addEventListener('resize', onWindowResize);

onWindowResize();

loadModel().then(() => {
    animate();
});

canvas.style.width = '100%';
canvas.style.height = '500px';

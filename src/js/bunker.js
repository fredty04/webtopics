import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const preventArrowScroll = (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
};

document.addEventListener('keydown', preventArrowScroll);

const canvas = document.querySelector('#canvas-bunker');
const section = document.querySelector('#bunker');

const sizes = {
    width: section.clientWidth,
    height: 500,
    aspect: section.clientWidth / 500
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspect, 0.1, 1000);
camera.position.set(0, 1.2, 5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.background = new THREE.Color(0x0F1A0A);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const loader = new GLTFLoader();

let bunker;
let soldier;

loader.load(
    '/models/bunker.glb',
    (gltf) => {
        bunker = gltf.scene;
        scene.add(bunker);
        
        const bunkerBox = new THREE.Box3().setFromObject(bunker);
        const center = bunkerBox.getCenter(new THREE.Vector3());
        bunker.position.sub(center);
        
        const size = bunkerBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim;
        bunker.scale.multiplyScalar(scale);

        bunker.position.y = -bunkerBox.min.y + 0.3;

        camera.position.set(0, 1.2, Math.max(bunkerBox.max.z - 2, 1));

        console.log('Bunker model perfect');
        
        loadSoldier();
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading bunker model:', error);
    }
);

function loadSoldier() {
    loader.load(
        '/models/daapsoldaat.glb',
        (gltf) => {
            soldier = gltf.scene;
            scene.add(soldier);
            
            soldier.scale.set(0.005, 0.005, 0.005);
            soldier.position.set(-0.7, 0.5, 9.7);
            
            console.log('daapsoldaat model loaded perfect');
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% soldier loaded');
        },
        (error) => {
            console.error('Error loading daapsoldaat:', error);
        }
    );
}

const moveSpeed = 0.1;
const rotateSpeed = 0.05;
const keysPressed = {};

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});

function moveCamera() {
    if (!bunker) return;

    const oldPosition = camera.position.clone();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; 
    direction.normalize();

    if (keysPressed['ArrowUp']) {
        camera.position.add(direction.multiplyScalar(moveSpeed));
    }
    if (keysPressed['ArrowDown']) {
        camera.position.add(direction.multiplyScalar(-moveSpeed));
    }
    if (keysPressed['ArrowLeft']) {
        camera.rotateY(rotateSpeed);
    }
    if (keysPressed['ArrowRight']) {
        camera.rotateY(-rotateSpeed);
    }

    camera.position.y = Math.max(camera.position.y, 1.2); 
}

function onWindowResize() {
    sizes.width = section.clientWidth;
    sizes.aspect = sizes.width / sizes.height;
    camera.aspect = sizes.aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
}

window.addEventListener('resize', onWindowResize);

function animate() {
    moveCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

onWindowResize();
animate();

canvas.style.width = '100%';
canvas.style.height = '500px';

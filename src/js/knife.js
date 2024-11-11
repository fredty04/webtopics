import * as THREE from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector('#knife-hitler');
const section = document.querySelector('#HitlerKnife');

const size = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    aspect: canvas.clientWidth / canvas.clientHeight
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, size.aspect, 0.1, 6000);
camera.position.set(0, 0, 5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.background = new THREE.Color(0x0F1A0A);

const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 4000);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 4000);
pointLight2.position.set(5, 5, -5);
scene.add(pointLight2);

const textureLoader = new THREE.TextureLoader();
const loader = new FBXLoader();

let knife;

loader.load('/models/HY_knife.fbx',
    (object) => {
        knife = object;
        knife.rotation.z = Math.PI * 1.5;

        knife.traverse((child) => {
            if (child.isMesh) {
                const baseColorTexture = textureLoader.load('/models/textures/HY_Base_Color.png');
                const ambientOcclusionTexture = textureLoader.load('/models/textures/HY_AmbientOcclusion.png');
                const metallicTexture = textureLoader.load('/models/textures/HY_Metallic.png');
                const normalTexture = textureLoader.load('/models/textures/HY_Normal_DirectX.png');
                const roughnessTexture = textureLoader.load('/models/textures/Roughness.png');

                child.material = new THREE.MeshStandardMaterial({
                    map: baseColorTexture,
                    aoMap: ambientOcclusionTexture,
                    metalnessMap: metallicTexture,
                    normalMap: normalTexture,
                    roughnessMap: roughnessTexture,
                });

                child.material.needsUpdate = true;
                child.material.metalness = 1;
                child.material.roughness = 1;
            }
        });

        scene.add(knife);
        console.log('Model loaded successfully with textures');

        const box = new THREE.Box3().setFromObject(knife);
        const center = box.getCenter(new THREE.Vector3());
        camera.position.z = box.max.z + 4;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading model:', error);
    }
);

const controls = new OrbitControls(camera, canvas);
controls.autoRotate = false;
controls.enablePan = false;
controls.enableDamping = true;

function resizeRendererToDisplaySize(renderer) {
    const canvasElement = renderer.domElement;
    const width = canvasElement.clientWidth;
    const height = canvasElement.clientHeight;
    const needResize = canvasElement.width !== width || canvasElement.height !== height;
    if (needResize) {
        renderer.setSize(width, height);
    }
    return needResize;
}

function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        size.width = canvas.clientWidth;
        size.height = canvas.clientHeight;
        size.aspect = size.width / size.height;
        camera.aspect = size.aspect;
        camera.updateProjectionMatrix();
    }
    
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
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

animate();

canvas.style.width = '100%';
canvas.style.height = '500px';

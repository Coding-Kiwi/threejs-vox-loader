import * as THREE from 'three';
import { VOXLoader } from '../src/index.js';


import { OrbitControls } from 'three/examples/jsm/Addons.js';
import carsUrl from "../tests/fixtures/cars.vox";
import cubeUrl from "../tests/fixtures/cube.vox";
import serverUrl from "../tests/fixtures/server.vox";
import twocubesUrl from "../tests/fixtures/twocubes.vox";

const MODELS = {
    server: serverUrl,
    cube: cubeUrl,
    cars: carsUrl,
    twocubes: twocubesUrl,
}

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement);

const axesHelper = new THREE.AxesHelper(32);
scene.add(axesHelper);

const d = 40;
const camera = new THREE.OrthographicCamera(window.innerWidth / -d, window.innerWidth / d, window.innerHeight / d, window.innerHeight / -d, 1, 1000);

camera.position.set(-20, 20, -20);
camera.lookAt(8, -8, 8);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new VOXLoader({
    enableMetalness: false,
    enableRoughness: false,
    lightIntensity: 20
});
let currentVoxScene = null;

function modelChange() {
    let url = MODELS[document.getElementById("modelSelect").value];

    loader.load(url, function (voxScene) {
        if (currentVoxScene) scene.remove(currentVoxScene);

        currentVoxScene = voxScene;
        currentVoxScene.castShadow = true;
        currentVoxScene.receiveShadow = true;

        scene.add(currentVoxScene);
    });
}

document.getElementById("modelSelect").addEventListener("change", modelChange)
modelChange();


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-20, 0, 0);
dirLight.castShadow = true;
scene.add(dirLight);

const dirLigh2 = new THREE.DirectionalLight(0xffffff, 2);
dirLigh2.position.set(0, 20, 0);
dirLigh2.castShadow = true;
scene.add(dirLigh2);

const dirLight3 = new THREE.PointLight(0xffffff, 1, 0, 0.5);
dirLight3.position.set(-20, 20, 0);
dirLight3.castShadow = true;
scene.add(dirLight3);


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
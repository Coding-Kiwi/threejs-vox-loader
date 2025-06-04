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

const d = 50;
const camera = new THREE.OrthographicCamera(window.innerWidth / -d, window.innerWidth / d, window.innerHeight / d, window.innerHeight / -d, 1, 1000);
const radius = 100;
const isoAngle = THREE.MathUtils.degToRad(35.264);
let angle = THREE.MathUtils.degToRad(135);
camera.position.set(
    radius * Math.cos(angle),
    radius * Math.sin(isoAngle),
    radius * Math.sin(angle)
);

camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new VOXLoader();
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

const hemiLight = new THREE.HemisphereLight(0xcccccc, 0x444444, 3);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(1.5, 3, 2.5);
dirLight.castShadow = true; // default false
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight2.position.set(- 1.5, - 3, - 2.5);
dirLight2.castShadow = true; // default false
scene.add(dirLight2);

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
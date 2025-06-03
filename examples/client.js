import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VOXLoader } from '../src/index.js';


import cubeUrl from "../tests/fixtures/cube.vox";
import carsUrl from "../tests/fixtures/cars.vox";
import twocubesUrl from "../tests/fixtures/twocubes.vox";

const MODELS = {
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

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 10
camera.position.x = 10
camera.position.y = 10
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement)

const loader = new VOXLoader();
let currentModel = null;

function modelChange() {
    let url = MODELS[document.getElementById("modelSelect").value];

    loader.load(url, function (meshes) {
        if (currentModel) scene.remove(currentModel);

        currentModel = new THREE.Group();

        for (let i = 0; i < meshes.length; i++) {
            const m = meshes[i];

            let size = 1;
            m.scale.setScalar(size);
            m.castShadow = true;
            m.receiveShadow = true;

            currentModel.add(m);

            const box3 = new THREE.Box3().setFromObject(m)
            const vector = new THREE.Vector3();
            box3.getCenter(vector);
            m.position.set(-vector.x, -vector.y, -vector.z);

            m.lights.forEach(l => {
                l.position.set(
                    l.position.x * size,
                    l.position.y * size,
                    l.position.z * size,
                );
                currentModel.add(l);
            })
        }

        scene.add(currentModel);

        renderer.render(scene, camera);
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
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
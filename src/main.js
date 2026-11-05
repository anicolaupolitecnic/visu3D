
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Crear l'escena 3D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// 2. Crear la càmera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 5);

// 3. Crear el renderitzador
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

// 4. Afegir il·luminació
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 5. Controls de rotació amb el ratolí
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 6. Carregar el model OBJ
const loader = new OBJLoader();

loader.load(
    '/models/tree.obj',

    function (object) {
        // Centrar el model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        object.position.sub(center);

        // Ajustar la mida del model
        const maxDimension = Math.max(size.x, size.y, size.z);

        if (maxDimension > 0) {
            object.scale.setScalar(3 / maxDimension);
        }

        scene.add(object);

        console.log('Model OBJ carregat correctament!');
    },

    function (xhr) {
        console.log(
            'Carregant model: ' +
            (xhr.total ? (xhr.loaded / xhr.total * 100).toFixed(0) : 0) +
            '%'
        );
    },

    function (error) {
        console.error('Error en carregar el model OBJ:', error);
    }
);

// 7. Adaptar l'escena quan canviï la mida de la finestra
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 8. Animació de l'escena
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();

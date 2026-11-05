
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --------------------------------------------------
// 1. ESCENA
// --------------------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// --------------------------------------------------
// 2. CÀMERA
// --------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

// --------------------------------------------------
// 3. RENDERITZADOR
// --------------------------------------------------

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// --------------------------------------------------
// 4. IL·LUMINACIÓ
// --------------------------------------------------

// Llum ambiental per suavitzar les ombres
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Llum hemisfèrica per donar volum al model
const hemisphereLight = new THREE.HemisphereLight(
  0xffffff,
  0xd0d0d0,
  1.2
);
scene.add(hemisphereLight);

// Llum principal cenital amb inclinació de 15 graus
const angle = THREE.MathUtils.degToRad(15);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  3
);

directionalLight.position.set(
  Math.sin(angle) * 10,
  Math.cos(angle) * 10,
  0
);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.bias = -0.0001;

scene.add(directionalLight);

// --------------------------------------------------
// 5. CONTROLS DE RATOLÍ
// --------------------------------------------------

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.enableRotate = true;
controls.enableZoom = true;

// Evitem desplaçar el model fora del centre
controls.enablePan = false;

// Zoom amb roda del ratolí
controls.zoomSpeed = 1.0;

// --------------------------------------------------
// 6. CARREGADOR DEL MODEL GLB
// --------------------------------------------------

const loader = new GLTFLoader();

let modelRadius = 1;

loader.load(
  new URL('../models/tree.glb', import.meta.url).href,

  function (gltf) {

    const model = gltf.scene;

    // Activar ombres en les malles
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Calcular les dimensions del model
    const box = new THREE.Box3().setFromObject(model);

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Centrar el model a l'origen de coordenades
    model.position.sub(center);

    // Afegir el model a l'escena
    scene.add(model);

    // Calcular la distància de càmera adequada
    const maxDimension = Math.max(size.x, size.y, size.z);

    const sphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(model).getBoundingSphere(sphere);

    modelRadius = sphere.radius;

    const distance =
      (modelRadius / Math.sin(
        THREE.MathUtils.degToRad(camera.fov / 2)
      )) * 1.5;

    // Posició inicial de la càmera
    camera.position.set(
      distance * 0.35,
      distance * 0.25,
      distance
    );

    camera.near = Math.max(0.001, distance / 1000);
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    // La càmera sempre mira al centre del model
    controls.target.set(0, 0, 0);

    controls.minDistance = modelRadius * 0.3;
    controls.maxDistance = distance * 5;

    controls.update();

    console.log('Model tree.glb carregat correctament');
    console.log('Dimensions:', size);
  },

  function (xhr) {
    if (xhr.total > 0) {
      console.log(
        'Carregant model:',
        Math.round((xhr.loaded / xhr.total) * 100) + '%'
      );
    }
  },

  function (error) {
    console.error('Error carregant tree.glb:', error);
  }
);

// --------------------------------------------------
// 7. ADAPTACIÓ A LA FINESTRA
// --------------------------------------------------

window.addEventListener('resize', function () {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

});

// --------------------------------------------------
// 8. BUCLE D'ANIMACIÓ
// --------------------------------------------------

function animate() {

  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);

}

animate();

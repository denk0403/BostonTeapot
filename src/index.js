"use strict";

let scene;
let threeCamera;
let renderer;
let controls;
let teapot;

let STOP_RENDER_FLAG = false;

// instantiate a OBJ file loader
const objLoader = new OBJLoader();
const textureLoader = new THREE.TextureLoader();

const init = () => {
    // get a reference to the canvas
    /**@type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");

    // --- Setup Scene ---
    scene = new THREE.Scene();
    const sceneBackgorund = textureLoader.load("./img/living_room_blur.jpg");
    scene.background = sceneBackgorund;

    // --- Setup Camera ---
    threeCamera = new THREE.PerspectiveCamera(90, canvas.width / canvas.height, 0.1, 1000);
    threeCamera.position.set(0, 3, 7);

    // --- Setup Renderer ---
    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = true;

    // --- Setup Camera controls ---
    controls = new OrbitControls(threeCamera, canvas);

    // --- Setup Lighting ---
    // Ambient Light
    const ambientColor = 0xffffff; // white
    const ambientIntensity = 0.5;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);
    // Directional Light
    const directionalColor = 0xffffff; // white
    const directionalIntensity = 0.67;
    const directionalLight = new THREE.DirectionalLight(directionalColor, directionalIntensity);
    directionalLight.castShadow = true;
    directionalLight.position.set(0, 25, 20);
    scene.add(directionalLight);

    // Setup ground plane
    const groundPlane = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundPlane, groundMaterial);
    groundMesh.receiveShadow = true;
    groundMesh.rotation.x = Math.PI * -0.5; // rotates to be horizontal
    scene.add(groundMesh);

    // Load and add Boston Teapot to scene
    loadObjFile("src/obj_files/boston_teapot.obj", (obj) => {
        // For any meshes in the model, add our material.
        teapot = obj;
        obj.traverse((node) => {
            if (node.isMesh) {
                // node.material = material;
            }
        });
    });

    // Load and add Mug to scene
    loadObjFile("src/obj_files/mug.obj", (obj) => {
        // For any meshes in the model, add our material.
        obj.position.set(5, 0, 0);
        obj.traverse((node) => {
            if (node.isMesh) {
                // node.material = material;
            }
        });
    });

    const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(cameraHelper);
};

const loadObjFile = (filePath, onload) => {
    objLoader.load(
        filePath, // resource URL
        (obj) => {
            onload?.(obj);
            addObjToScene(obj);
        }, // called when resource is loaded
        showLoadProgress, // called when loading is in progresse
        (error) => handleObjLoadError(error, filePath), // called when loading has errors
    );
};

const showLoadProgress = (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
};

const handleObjLoadError = (error, file) => {
    console.error(`Something went wrong loading ${file}`, error);
};

const addObjToScene = (obj) => {
    // enable all shadows
    obj.castShadow = true;
    obj.receiveShadow = true;
    obj.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    // add object to scene
    scene.add(obj);
};

/**
 * Renders the array of shapes onto the WebGL canvas.
 */
const render = () => {
    if (STOP_RENDER_FLAG) {
        STOP_RENDER_FLAG = false;
    } else {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, threeCamera);
    }
};

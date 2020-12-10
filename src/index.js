"use strict";

const up = [0, 1, 0]; // declare up to be in +y direction
let lookAt = true; // we'll toggle lookAt on and off

/** @type {WebGLRenderingContext} */
let gl; // reference to canvas's WebGL context, main API

/** @type {Number} */
let attributeCoords; // sets 2D location of shapes

/** @type {WebGLUniformLocation} */
let uniformMatrix; // sets transformation matrix of shapes

/** @type {WebGLUniformLocation} */
let uniformColor; // sets the color of the squares

/** @type {WebGLBuffer} */
let bufferCoords; // sends geometry to GPU

/** @type {Number} */
let selectedShapeIndex = 0; // The index of the currently selected shape in the shapes array

let scene;
let threeCamera;
let renderer;
let controls;

let attributeNormals; // links to shader's a_normal
let uniformWorldViewProjection; // links to shader's u_worldViewProjection
let uniformWorldInverseTranspose; // links to shader's u_worldInverseTranspose
let uniformReverseLightDirectionLocation; // links to shader's u_reverseLightDirectionLocation
let normalBuffer; // buffer to send normals to GPU

const init = () => {
    // get a reference to the canvas
    /**@type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");

    scene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(90, canvas.width / canvas.height, 0.1, 1000);
    threeCamera.position.set(0, 3, 7);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = true;

    controls = new OrbitControls(threeCamera, canvas);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.5;
    const directionalColor = 0xffffff;
    const directionalIntensity = 0.5;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    const directionalLight = new THREE.DirectionalLight(directionalColor, directionalIntensity);
    directionalLight.position.set(0, 10, 0);
    directionalLight.target.position.set(0, 0, 0);

    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI * -0.5;

    // instantiate a loader
    const loader = new OBJLoader();
    const loader2 = new THREE.TextureLoader();
    const texture = new THREE.TextureLoader().load( 'clay.jpg');
    const texture2 = new THREE.TextureLoader().load( 'clay2.jpg');
    const material = new THREE.MeshStandardMaterial( { map: texture } );
    const material2 = new THREE.MeshStandardMaterial( { map: texture2 } );
    //loader.setMaterials(new THREE.MeshPhongMaterial( {color: '#0000FF'} ));
    // load a resource
    loader.load(
        // resource URL
        "src/obj_files/teapot.obj",
        // called when resource is loaded
        (obj) => {
            obj.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.material = material;
                    node.material.bumpMap = new THREE.TextureLoader().load( 'clay.jpg');
                    node.material.bumpScale = 3.0
                }
                // new THREE.MeshPhongMaterial({
                //     color:0xffffff,
                //     map:material
                // })
            });
            obj.castShadow = true;
            obj.receiveShadow = true;
            scene.add(obj);
        },
        // called when loading is in progresses
        (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
        // called when loading has errors
        (error) => console.error("Something went wrong loading Teapot OBJ File", error),
    );

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(0, cubeSize / 2 + 9, 0);

    cubeMesh.receiveShadow = true;
    cubeMesh.castShadow = true;
    scene.add(cubeMesh);

    directionalLight.castShadow = true;
    floorMesh.receiveShadow = true;

    scene.add(floorMesh);
    scene.add(directionalLight);
    scene.add(ambientLight);
    scene.add(directionalLight.target);

    const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(cameraHelper);

    // // Get WebGL context
    // gl = canvas.getContext("webgl2");

    // document.getElementById("dlrx").value = camera.translation.x;
    // document.getElementById("dlry").value = camera.translation.y;
    // document.getElementById("dlrz").value = camera.translation.z;

    // document.getElementById("dlrx").oninput = (event) =>
    //     webglUtils.updateCameraTranslation(event, "x");
    // document.getElementById("dlry").oninput = (event) =>
    //     webglUtils.updateCameraTranslation(event, "y");
    // document.getElementById("dlrz").oninput = (event) =>
    //     webglUtils.updateCameraTranslation(event, "z");

    // // create and use a GLSL program
    // const program = webglUtils.createProgramFromScripts(
    //     gl,
    //     "#vertex-shader-3d",
    //     "#fragment-shader-3d",
    // );
    // gl.useProgram(program);

    // // get reference to GLSL attributes and uniforms
    // attributeCoords = gl.getAttribLocation(program, "a_coords");
    // uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    // const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    // uniformColor = gl.getUniformLocation(program, "u_color");

    // // initialize coordinate attribute to send each vertex to GLSL program
    // gl.enableVertexAttribArray(attributeCoords);

    // // initialize coordinate buffer to send array of vertices to GPU
    // bufferCoords = gl.createBuffer();

    // // get the "a_normals" attribute
    // attributeNormals = gl.getAttribLocation(program, "a_normals");
    // // enable it
    // gl.enableVertexAttribArray(attributeNormals);
    // // create a buffer to send normals
    // normalBuffer = gl.createBuffer();

    // // Get various uniforms:
    // // u_worldViewProjection
    // uniformWorldViewProjection = gl.getUniformLocation(program, "u_worldViewProjection");
    // // u_worldInverseTranspose
    // uniformWorldInverseTranspose = gl.getUniformLocation(program, "u_worldInverseTranspose");
    // // u_reverseLightDirection
    // uniformReverseLightDirectionLocation = gl.getUniformLocation(
    //     program,
    //     "u_reverseLightDirection",
    // );

    // // configure canvas resolution and clear the canvas
    // gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

/**
 * Helper function for returning the transformation matrix for a given shape.
 * @param {Shape} shape
 * @param {number[]} viewProjectionMatrix
 */
const computeModelViewMatrix = (shape, viewProjectionMatrix) => {
    let M = m4.translate(
        viewProjectionMatrix,
        shape.translation.x,
        shape.translation.y,
        shape.translation.z,
    );
    M = m4.xRotate(M, m4.degToRad(shape.rotation.x));
    M = m4.yRotate(M, m4.degToRad(shape.rotation.y));
    M = m4.zRotate(M, m4.degToRad(shape.rotation.z));
    M = m4.scale(M, shape.scale.x, shape.scale.y, shape.scale.z);
    return M;
};

const fieldOfViewRadians = m4.degToRad(90);

/**
 * Renders the array of shapes onto the WebGL canvas.
 */
const render = () => {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, threeCamera);
};

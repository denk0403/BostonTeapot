"use strict";

const up = [0, 1, 0]; // declare up to be in +y direction
let target = [5, 5, 5]; // declare the origin as the target we'll look at
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

let attributeNormals; // links to shader's a_normal
let uniformWorldViewProjection; // links to shader's u_worldViewProjection
let uniformWorldInverseTranspose; // links to shader's u_worldInverseTranspose
let uniformReverseLightDirectionLocation; // links to shader's u_reverseLightDirectionLocation
let normalBuffer; // buffer to send normals to GPU

const init = () => {
    // get a reference to the canvas
    /**@type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");

    // Get WebGL context
    gl = canvas.getContext("webgl");

    // create and use a GLSL program
    const program = webglUtils.createProgramFromScripts(
        gl,
        "#vertex-shader-3d",
        "#fragment-shader-3d",
    );
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // initialize coordinate attribute to send each vertex to GLSL program
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer to send array of vertices to GPU
    bufferCoords = gl.createBuffer();

    // get the "a_normals" attribute
    attributeNormals = gl.getAttribLocation(program, "a_normals");
    // enable it
    gl.enableVertexAttribArray(attributeNormals);
    // create a buffer to send normals
    normalBuffer = gl.createBuffer();

    // Get various uniforms:
    // u_worldViewProjection
    uniformWorldViewProjection = gl.getUniformLocation(program, "u_worldViewProjection");
    // u_worldInverseTranspose
    uniformWorldInverseTranspose = gl.getUniformLocation(program, "u_worldInverseTranspose");
    // u_reverseLightDirection
    uniformReverseLightDirectionLocation = gl.getUniformLocation(
        program,
        "u_reverseLightDirection",
    );

    // configure canvas resolution and clear the canvas
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(attributeCoords, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attributeNormals, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;

    let cameraMatrix = m4.identity();
    if (lookAt) {
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z,
        );
        const cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        cameraMatrix = m4.inverse(cameraMatrix);
    } else {
        cameraMatrix = m4.zRotate(cameraMatrix, m4.degToRad(camera.rotation.z));
        cameraMatrix = m4.xRotate(cameraMatrix, m4.degToRad(camera.rotation.x));
        cameraMatrix = m4.yRotate(cameraMatrix, m4.degToRad(camera.rotation.y));
        cameraMatrix = m4.translate(
            cameraMatrix,
            camera.translation.x,
            camera.translation.y,
            camera.translation.z,
        );
    }
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    const viewProjectionMatrix = m4.multiply(projectionMatrix, cameraMatrix);

    const worldMatrix = m4.identity();
    const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    const worldInverseMatrix = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    gl.uniformMatrix4fv(uniformWorldViewProjection, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(uniformWorldInverseTranspose, false, worldInverseTransposeMatrix);

    gl.uniform3fv(uniformReverseLightDirectionLocation, m4.normalize(lightSource));

    if (shapes.length === 0) {
        gl.drawArrays(gl.TRIANGLES, 0, 0);
    } else {
        shapes.forEach((shape, index) => {
            gl.uniform4f(uniformColor, shape.color.red, shape.color.green, shape.color.blue, 1);

            const matrix = computeModelViewMatrix(shape, worldViewProjectionMatrix);

            // apply transformation matrix.
            gl.uniformMatrix4fv(uniformWorldViewProjection, false, matrix);

            if (shape.type === BOSTON_TEAPOT) {
                webglUtils.renderRectangle(shape);
            } else if (shape.type === CUBE) {
                webglUtils.renderCube(shape);
            }
        });
    }
};

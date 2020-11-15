"use strict";

/**
 * @typedef RGBColor
 * @property {Number} red
 * @property {Number} green
 * @property {Number} blue
 */

/**
 * A collection of helper function for WebGL.
 */
const webglUtils = {
    /**
     * Converts a hex color to its rgb representation.
     * @param {String} hex The hexadecimal representation of a color
     * @returns {RGBColor}
     */
    hexToRgb: (hex) => {
        let parseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let rgb = {
            red: parseInt(parseRgb[1], 16),
            green: parseInt(parseRgb[2], 16),
            blue: parseInt(parseRgb[3], 16),
        };
        rgb.red /= 256;
        rgb.green /= 256;
        rgb.blue /= 256;
        return rgb;
    },
    /**
     * Return the hex digits of a decimal number
     * @param {Number} c
     * @returns {String}
     */
    componentToHex: (c) => {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    /**
     * Converts a RGB color to its Hex equivalent.
     * @param {RGBColor} rgb
     * @returns {String}
     */
    rgbToHex: (rgb) => {
        const redHex = webglUtils.componentToHex(rgb.red * 256);
        const greenHex = webglUtils.componentToHex(rgb.green * 256);
        const blueHex = webglUtils.componentToHex(rgb.blue * 256);
        return `#${redHex}${greenHex}${blueHex}`;
    },
    /**
     * Creates a program from given shader scripts.
     * @param {WebGLRenderingContext} gl
     * @param {String} vertexShaderElementId
     * @param {String} fragmentShaderElementId
     * @returns {WebGLProgram}
     */
    createProgramFromScripts: (gl, vertexShaderElementId, fragmentShaderElementId) => {
        // Get the strings for our GLSL shaders
        const vertexShaderElement = document.querySelector(vertexShaderElementId);
        const fragmentShaderElement = document.querySelector(fragmentShaderElementId);

        const vertexShaderSource = vertexShaderElement.text;
        const fragmentShaderSource = fragmentShaderElement.text;

        // Create GLSL shaders, upload the GLSL source, compile the shaders
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        // Link the two shaders into a program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        return program;
    },
    updateCameraAngle: (event) => {
        cameraAngleRadians = m4.degToRad(event.target.value);
        render();
    },
    /**
     * Toggles the canvas's "look at" strategy an rerenders.
     * @param {InputEvent} event
     */
    toggleLookAt: (event) => {
        lookAt = event.target.checked;
        render();
    },
    updateFieldOfView: (event) => {
        fieldOfViewRadians = m4.degToRad(event.target.value);
        render();
    },
    updateTranslation: (event, axis) => {
        shapes[selectedShapeIndex].translation[axis] = event.target.value;
        render();
    },
    updateRotation: (event, axis) => {
        shapes[selectedShapeIndex].rotation[axis] = event.target.value;
        render();
    },
    updateScale: (event, axis) => {
        shapes[selectedShapeIndex].scale[axis] = event.target.value;
        render();
    },
    updateColor: (event) => {
        const hex = event.target.value;
        const rgb = webglUtils.hexToRgb(hex);
        shapes[selectedShapeIndex].color = rgb;
        render();
    },
    /**
     * Updates the given camera axis position and rerenders.
     * @param {InputEvent} event
     * @param {String} axis
     */
    updateCameraTranslation: (event, axis) => {
        camera.translation[axis] = event.target.value;
        render();
    },
    /**
     * Updates the given camera axis rotation and rerenders.
     * @param {InputEvent} event
     * @param {String} axis
     */
    updateCameraRotation: (event, axis) => {
        camera.rotation[axis] = event.target.value;
        render();
    },
    /**
     * Updates the given "look at" axis position and rerenders.
     * @param {InputEvent} event
     * @param {String} index
     */
    updateLookAtTranslation: (event, index) => {
        target[index] = event.target.value;
        render();
    },
    /**
     * Updates the given light direction axis and rerenders.
     * @param {InputEvent} event
     * @param {String} index
     */
    updateLightDirection: (event, index) => {
        lightSource[index] = parseFloat(event.target.value);
        render();
    },
    /**
     * Adds an abstract shape to the array of shapes
     * and rerenders the canvas.
     * @param {Shape} newShape
     * @param {String} type
     */
    addShape: (newShape, type) => {
        const colorHex = document.getElementById("color").value;
        const colorRgb = webglUtils.hexToRgb(colorHex);
        let tx = 0;
        let ty = 0;
        let tz = 0;
        const shape = {
            type: type,
            center: ORIGIN,
            dimensions: UNIT_SIZE,
            color: colorRgb,
            translation: { x: tx, y: ty, z: tz },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 20, y: 20, z: 20 },
        };
        if (newShape) {
            Object.assign(shape, newShape);
        }
        shapes.push(shape);
        render();
    },
    /**
     * Removes the shape at the given index from the
     * shapes array and rerenders the canvas.
     * @param {Number} shapeIndex
     */
    deleteShape: (shapeIndex) => {
        shapes.splice(shapeIndex, 1);
        if (shapes.length > 0) {
            webglUtils.selectShape(0);
            render();
        } else {
            selectedShapeIndex = -1;
        }
    },
    selectShape: (selectedIndex) => {
        selectedShapeIndex = selectedIndex;
        document.getElementById("tx").value = shapes[selectedIndex].translation.x;
        document.getElementById("ty").value = shapes[selectedIndex].translation.y;
        document.getElementById("tz").value = shapes[selectedIndex].translation.z;
        document.getElementById("sx").value = shapes[selectedIndex].scale.x;
        document.getElementById("sy").value = shapes[selectedIndex].scale.y;
        document.getElementById("sz").value = shapes[selectedIndex].scale.z;
        document.getElementById("rx").value = shapes[selectedIndex].rotation.x;
        document.getElementById("ry").value = shapes[selectedIndex].rotation.y;
        document.getElementById("rz").value = shapes[selectedIndex].rotation.z;
        document.getElementById("fv").value = m4.radToDeg(fieldOfViewRadians);
        const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color);
        document.getElementById("color").value = hexColor;
    },
    /**
     * Handles mouse down events on the canvas
     * @param {MouseEvent} event
     */
    doMouseDown: (event) => {
        const boundingRectangle = gl.canvas.getBoundingClientRect();
        const x = Math.round(event.clientX - boundingRectangle.left - boundingRectangle.width / 2);
        const y = -Math.round(event.clientY - boundingRectangle.top - boundingRectangle.height / 2);
        const translation = { x, y, z: -150 };
        const rotation = { x: 0, y: 0, z: 180 };
        const type = document.querySelector("input[name='shape']:checked").value;
        const shape = {
            translation,
            rotation,
            type,
        };

        webglUtils.addShape(shape, type);
    },
    /**
     * @param {Shape} cube
     */
    renderCube: (cube) => {
        const geometry = [
            0,
            0,
            0,
            0,
            30,
            0,
            30,
            0,
            0,
            0,
            30,
            0,
            30,
            30,
            0,
            30,
            0,
            0,
            0,
            0,
            30,
            30,
            0,
            30,
            0,
            30,
            30,
            0,
            30,
            30,
            30,
            0,
            30,
            30,
            30,
            30,
            0,
            30,
            0,
            0,
            30,
            30,
            30,
            30,
            30,
            0,
            30,
            0,
            30,
            30,
            30,
            30,
            30,
            0,
            0,
            0,
            0,
            30,
            0,
            0,
            30,
            0,
            30,
            0,
            0,
            0,
            30,
            0,
            30,
            0,
            0,
            30,
            0,
            0,
            0,
            0,
            0,
            30,
            0,
            30,
            30,
            0,
            0,
            0,
            0,
            30,
            30,
            0,
            30,
            0,
            30,
            0,
            30,
            30,
            0,
            0,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            0,
            0,
            30,
            30,
            0,
        ];
        const float32Array = new Float32Array(geometry);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
        gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

        const normals = new Float32Array([
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    },
    /**
     * @param {Shape} sphere
     */
    renderSphere: (sphere) => {
        const geometry = [
            0,
            0,
            0,
            0,
            30,
            0,
            30,
            0,
            0,
            0,
            30,
            0,
            30,
            30,
            0,
            30,
            0,
            0,
            0,
            0,
            30,
            30,
            0,
            30,
            0,
            30,
            30,
            0,
            30,
            30,
            30,
            0,
            30,
            30,
            30,
            30,
            0,
            30,
            0,
            0,
            30,
            30,
            30,
            30,
            30,
            0,
            30,
            0,
            30,
            30,
            30,
            30,
            30,
            0,
            0,
            0,
            0,
            30,
            0,
            0,
            30,
            0,
            30,
            0,
            0,
            0,
            30,
            0,
            30,
            0,
            0,
            30,
            0,
            0,
            0,
            0,
            0,
            30,
            0,
            30,
            30,
            0,
            0,
            0,
            0,
            30,
            30,
            0,
            30,
            0,
            30,
            0,
            30,
            30,
            0,
            0,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            0,
            0,
            30,
            30,
            0,
        ];
        const float32Array = new Float32Array(geometry);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
        gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

        const normals = new Float32Array([
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            -1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    },
    /**
     * @param {Shape} letterF
     */
    renderLetterF: (letterF) => {
        const geometry = [
            // left column front [ok]
            0,
            0,
            0,
            0,
            150,
            0,
            30,
            0,
            0,
            0,
            150,
            0,
            30,
            150,
            0,
            30,
            0,
            0,

            // top rung front
            30,
            0,
            0,
            30,
            30,
            0,
            100,
            0,
            0,
            30,
            30,
            0,
            100,
            30,
            0,
            100,
            0,
            0,

            // middle rung front
            30,
            60,
            0,
            30,
            90,
            0,
            67,
            60,
            0,
            30,
            90,
            0,
            67,
            90,
            0,
            67,
            60,
            0,

            // left column back [ok]
            0,
            0,
            30,
            30,
            0,
            30,
            0,
            150,
            30,
            0,
            150,
            30,
            30,
            0,
            30,
            30,
            150,
            30,

            // top rung back
            30,
            0,
            30,
            100,
            0,
            30,
            30,
            30,
            30,
            30,
            30,
            30,
            100,
            0,
            30,
            100,
            30,
            30,

            // middle rung back
            30,
            60,
            30,
            67,
            60,
            30,
            30,
            90,
            30,
            30,
            90,
            30,
            67,
            60,
            30,
            67,
            90,
            30,

            // top [ok]
            0,
            0,
            0,
            100,
            0,
            0,
            100,
            0,
            30,
            0,
            0,
            0,
            100,
            0,
            30,
            0,
            0,
            30,

            // top rung right
            100,
            0,
            0,
            100,
            30,
            0,
            100,
            30,
            30,
            100,
            0,
            0,
            100,
            30,
            30,
            100,
            0,
            30,

            // under top rung
            30,
            30,
            0,
            30,
            30,
            30,
            100,
            30,
            30,
            30,
            30,
            0,
            100,
            30,
            30,
            100,
            30,
            0,

            // between top rung and middle
            30,
            30,
            0,
            30,
            60,
            30,
            30,
            30,
            30,
            30,
            30,
            0,
            30,
            60,
            0,
            30,
            60,
            30,

            // top of middle rung
            30,
            60,
            0,
            67,
            60,
            30,
            30,
            60,
            30,
            30,
            60,
            0,
            67,
            60,
            0,
            67,
            60,
            30,

            // right of middle rung
            67,
            60,
            0,
            67,
            90,
            30,
            67,
            60,
            30,
            67,
            60,
            0,
            67,
            90,
            0,
            67,
            90,
            30,

            // bottom of middle rung.
            30,
            90,
            0,
            30,
            90,
            30,
            67,
            90,
            30,
            30,
            90,
            0,
            67,
            90,
            30,
            67,
            90,
            0,

            // right of bottom
            30,
            90,
            0,
            30,
            150,
            30,
            30,
            90,
            30,
            30,
            90,
            0,
            30,
            150,
            0,
            30,
            150,
            30,

            // bottom [ok]
            0,
            150,
            0,
            0,
            150,
            30,
            30,
            150,
            30,
            0,
            150,
            0,
            30,
            150,
            30,
            30,
            150,
            0,

            // left side [ok]
            0,
            0,
            0,
            0,
            0,
            30,
            0,
            150,
            30,
            0,
            0,
            0,
            0,
            150,
            30,
            0,
            150,
            0,
        ];
        const float32Array = new Float32Array(geometry);
        gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
    },
};

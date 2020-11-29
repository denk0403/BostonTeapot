/**
 * @typedef Shape
 * @property {"RECTANGLE" | "TRIANGLE" | "CIRCLE" | "STAR" | "CUBE"} type
 * @property {{ x: Number, y: Number, z: Number }} center
 * @property {{ width: Number, height: Number }} dimensions
 * @property {RGBColor} color
 * @property {{ x: Number, y: Number, z: Number }} translation
 * @property {{ x: Number, y: Number, z: Number }} rotation
 * @property {{ x: Number, y: Number, z: Number }} scale
 */

const RED_HEX = "#FF0000";
const RED_RGB = webglUtils.hexToRgb(RED_HEX);
const BLUE_HEX = "#0000FF";
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX);
const GREEN_HEX = "#00FF00";
const GREEN_RGB = webglUtils.hexToRgb(GREEN_HEX);

// 3D-SHAPES
const CUBE = "CUBE";
const BOSTON_TEAPOT = "BOSTON_TEAPOT";

const ORIGIN = { x: 0, y: 0, z: 0 };
const UNIT_SIZE = { width: 1, height: 1, depth: 1 };

// Camera constants and values
const camera = {
    translation: { x: -20, y: 35, z: -35 },
    rotation: { x: 0, y: 0, z: 0 },
};
const target = [-10, 0, 5]; // declare the origin as the target we'll look at

// Light Source constants
const lightSource = [-1, -2, 2];

/**
 * @type {Shape[]}
 */
const shapes = [
    {
        type: CUBE,
        center: ORIGIN,
        dimensions: { ...UNIT_SIZE },
        color: { ...GREEN_RGB },
        translation: { x: 20, y: 0, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        type: CUBE,
        center: ORIGIN,
        dimensions: { ...UNIT_SIZE },
        color: { ...BLUE_RGB },
        translation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        type: BOSTON_TEAPOT,
        center: ORIGIN,
        dimensions: { ...UNIT_SIZE },
        color: { ...RED_RGB },
        translation: { x: -20, y: 0, z: 5 },
        scale: { x: 10, y: 10, z: 10 },
        rotation: { x: 0, y: 0, z: 180 },
    },
];

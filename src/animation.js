function linearInterp(startVal, endVal, fraction) {
    return (endVal - startVal) * fraction + startVal;
}

function linearInterpObj(startObj, endObj, fraction) {
    const result = {};
    for (const prop in startObj) {
        result[prop] = linearInterp(startObj[prop], endObj[prop], fraction);
    }
    return result;
}

const translationStart = { x: -20, y: 0, z: 5 };
const rotationStart = { x: 0, y: 0, z: 180 };
const translationEnd = { x: -20, y: 15, z: 5 };
const rotationEnd = { x: 0, y: 0, z: 210 };

let time = 0;
let stopSignal = false;
let completeSignal = false;
const POUR_DURATION = 1000;
const POUR_PAUSE_DURATION = 2000;
const ANIMATION_DURATION = 2 * (POUR_DURATION + POUR_PAUSE_DURATION);

const teapot = shapes[2];

function updateTeapot(timestamp) {
    const passedTime = (timestamp - time) % ANIMATION_DURATION;
    if (passedTime < POUR_DURATION) {
        teapot.translation = linearInterpObj(
            translationStart,
            translationEnd,
            passedTime / POUR_DURATION,
        );
        teapot.rotation = linearInterpObj(rotationStart, rotationEnd, passedTime / POUR_DURATION);
    } else if (
        passedTime > POUR_DURATION + POUR_PAUSE_DURATION &&
        passedTime < ANIMATION_DURATION - POUR_PAUSE_DURATION
    ) {
        teapot.translation = linearInterpObj(
            translationStart,
            translationEnd,
            (ANIMATION_DURATION - POUR_PAUSE_DURATION - passedTime) / POUR_DURATION,
        );
        teapot.rotation = linearInterpObj(
            rotationStart,
            rotationEnd,
            (ANIMATION_DURATION - POUR_PAUSE_DURATION - passedTime) / POUR_DURATION,
        );
    }
}

function doAnimation() {
    if (!stopSignal) {
        window.requestAnimationFrame((timestamp) => {
            updateTeapot(timestamp);
            render();
            if (
                !completeSignal ||
                (timestamp - time) % ANIMATION_DURATION < ANIMATION_DURATION - POUR_PAUSE_DURATION
            ) {
                doAnimation();
            }
        });
    }
}

function startAnimation() {
    stopSignal = false;
    completeSignal = false;
    time = window.performance.now();
    doAnimation();
}

function pauseAnimation() {
    if (!completeSignal) {
        stopSignal = true;
        time = (window.performance.now() - time) % ANIMATION_DURATION;
    }
}

function resumeAnimation() {
    if (!completeSignal) {
        stopSignal = false;
        time = window.performance.now() - time;
        doAnimation();
    }
}

function completeAnimation() {
    completeSignal = true;
}

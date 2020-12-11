function linearInterp(startVal, endVal, fraction) {
    return (endVal - startVal) * fraction + startVal;
}

function linearInterpObj(startObj, endObj, fraction) {
    const result = {};
    for (const prop in startObj) {
        result[prop] = linearInterp(
            Number(startObj[prop]) || 0,
            Number(endObj[prop]) || 0,
            fraction,
        );
    }
    return result;
}

function updateTeapotPosition(position) {
    teapot?.position.set(position.x, position.y, position.z);
    return teapot?.position;
}

function updateTeapotRotation(rotation) {
    teapot?.rotation.set(rotation.x, rotation.y, rotation.z);
    return teapot?.rotation;
}

const positionStart = { x: 0, y: 0, z: 0 };
const rotationStart = { x: 0, y: 0, z: 0 };
const positionEnd = { x: 0, y: 5, z: 0 };
const rotationEnd = { x: 0, y: 0, z: -Math.PI / 4 };

let time = 0;
let stopSignal = false;
let completeSignal = false;
const POUR_DURATION = 1000;
const POUR_PAUSE_DURATION = 2000;
const ANIMATION_DURATION = 2 * (POUR_DURATION + POUR_PAUSE_DURATION);

function updateTeapot(timestamp) {
    const passedTime = (timestamp - time) % ANIMATION_DURATION;
    if (passedTime < POUR_DURATION) {
        updateTeapotPosition(
            linearInterpObj(positionStart, positionEnd, passedTime / POUR_DURATION),
        );
        updateTeapotRotation(
            linearInterpObj(rotationStart, rotationEnd, passedTime / POUR_DURATION),
        );
    } else if (
        passedTime > POUR_DURATION + POUR_PAUSE_DURATION &&
        passedTime < ANIMATION_DURATION - POUR_PAUSE_DURATION
    ) {
        updateTeapotPosition(
            linearInterpObj(
                positionStart,
                positionEnd,
                (ANIMATION_DURATION - POUR_PAUSE_DURATION - passedTime) / POUR_DURATION,
            ),
        );
        updateTeapotRotation(
            linearInterpObj(
                rotationStart,
                rotationEnd,
                (ANIMATION_DURATION - POUR_PAUSE_DURATION - passedTime) / POUR_DURATION,
            ),
        );
    }
}

function doAnimation() {
    if (!stopSignal) {
        window.requestAnimationFrame((timestamp) => {
            updateTeapot(timestamp);
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

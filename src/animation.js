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
let lastTimeStamp = 0;
let stopSignal = false;
let completeSignal = false;
const POUR_DURATION = 1000;
const POUR_PAUSE_DURATION = 2000;
const ANIMATION_DURATION = 2 * (POUR_DURATION + POUR_PAUSE_DURATION);

/** @type {HTMLInputElement} */
let timeSlider;

window.addEventListener("DOMContentLoaded", () => {
    timeSlider = document.getElementById("time_slider");
    timeSlider.min = 0;
    timeSlider.max = ANIMATION_DURATION;

    timeSlider.addEventListener("input", () => {
        stopSignal = true;
        time = timeSlider.value;
        updateTeapot(time);
    });
});

function playAnimation() {
    stopSignal = false;
    if (time === 0) {
        completeSignal = false;
    }
    lastTimeStamp = window.performance.now();
    doAnimation();
}

function stopAnimation() {
    stopSignal = true;
    time = 0;
    updateTeapot(0);
}

function pauseAnimation() {
    stopSignal = true;
}

function finishAnimation() {
    completeSignal = true;
}

function doAnimation() {
    if (!stopSignal) {
        window.requestAnimationFrame((timestamp) => {
            if (!stopSignal) {
                const dt = timestamp - lastTimeStamp;
                lastTimeStamp = timestamp;
                time = (time + dt) % ANIMATION_DURATION;
                if (completeSignal && time > ANIMATION_DURATION - POUR_PAUSE_DURATION) {
                    stopSignal = true;
                    time = 0;
                }
                doAnimation();
            }
        });
    }
    updateTeapot(time);
}

function updateTeapot(renderTime) {
    timeSlider.value = renderTime;
    if (renderTime < POUR_DURATION) {
        updateTeapotPosition(
            linearInterpObj(positionStart, positionEnd, renderTime / POUR_DURATION),
        );
        updateTeapotRotation(
            linearInterpObj(rotationStart, rotationEnd, renderTime / POUR_DURATION),
        );
    } else if (renderTime < POUR_DURATION + POUR_PAUSE_DURATION) {
        updateTeapotPosition(positionEnd);
        updateTeapotRotation(rotationEnd);
    } else if (renderTime < ANIMATION_DURATION - POUR_PAUSE_DURATION) {
        updateTeapotPosition(
            linearInterpObj(
                positionStart,
                positionEnd,
                (ANIMATION_DURATION - POUR_PAUSE_DURATION - renderTime) / POUR_DURATION,
            ),
        );
        updateTeapotRotation(
            linearInterpObj(
                rotationStart,
                rotationEnd,
                (ANIMATION_DURATION - POUR_PAUSE_DURATION - renderTime) / POUR_DURATION,
            ),
        );
    } else {
        updateTeapotPosition(positionStart);
        updateTeapotRotation(rotationStart);
    }
}
